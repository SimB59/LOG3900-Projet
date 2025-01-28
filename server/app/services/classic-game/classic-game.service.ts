import { GameHistory } from '@app/model/database/game-history';
import { PlayerStats } from '@app/model/database/player-stats';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { TIMER_INTERVAL, TIME_DIVIDE_FACTOR } from '@app/services/game-manager/game-manager.service.constants';
import { GameService } from '@app/services/game/game.service';
import { FIRST_PLAYER, GameMode, LANGUAGE, POSITION_NOT_VALID, TIMEZONE } from '@app/services/game/game.service.constants';
import { StatsService } from '@app/services/stats/stats.service';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { SuccessClick } from '@common/success-click';
import { Winner } from '@common/winner';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class ClassicGameService extends GameService implements GameMode {
    differencesFound: Coordinate[][];
    private totalDifferenceCount: number;
    private card: Card;
    private winnerSocket: Socket;

    // Allowed to have more than 3 parameters since most are services (Approved by Mike, 13/03/2023)
    // eslint-disable-next-line max-params
    constructor(
        server: Server,
        dbService: DatabaseService,
        cardService: CardService,
        players: PlayerData[],
        constants: GameConstants,
        private statService: StatsService = new StatsService(dbService),
    ) {
        super(server, cardService, players, constants, dbService);
        this.gameTimer = { timer: null, counter: 0 };
    }

    isGameEnded(): boolean {
        let bestPlayerScore = 0;
        let bestPlayerSocket: Socket = this.playerData[0].socket;
        let totalDifferencesRemaining = this.totalDifferenceCount;
        for (const player of this.playerData) {
            totalDifferencesRemaining -= player.foundDifferencesCount;
            if (player.foundDifferencesCount > bestPlayerScore) {
                bestPlayerScore = player.foundDifferencesCount;
                bestPlayerSocket = player.socket;
            }
        }

        for (const player of this.playerData) {
            if (
                player.socket.id !== bestPlayerSocket.id &&
                this.playerCanStillWin(totalDifferencesRemaining, bestPlayerScore, player.foundDifferencesCount)
            ) {
                return false;
            }
        }

        this.winnerSocket = bestPlayerSocket;

        return true;
    }

    async updateLevelAndRank(winnerSocketId: string): Promise<void> {
        for (const player of this.playersPlaying) {
            const account = await this.dbService.findAccount({ pseudo: player.name });
            account.accountLevel++;
            if (player.socket.id === winnerSocketId) {
                account.accountRank++;
            } else {
                if (account.accountRank === 0) {
                    account.accountRank = 0;
                } else {
                    account.accountRank = account.accountRank - 1;
                }
            }
            this.dbService.updatePseudo({ pseudo: player.name }, account);
        }
    }

    async addHistory(winnerSocketId: string): Promise<GameHistory[]> {
        const historyList: GameHistory[] = [];
        for (const player of this.playersPlaying) {
            const accountId = await this.dbService.findAccountId({ pseudo: player.name });
            const history: GameHistory = {
                date: this.timestampStart.toLocaleDateString(LANGUAGE, TIMEZONE),
                time: this.timestampStart.toLocaleTimeString('en-GB', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZone: 'America/Montreal',
                }),
                accountId,
                isWinner: player.socket.id === winnerSocketId,
                duration: this.timeLength,
                numberOfDifferenceFound: player.foundDifferencesCount,
                firstMode: 'classique',
                gameId: '',
            };
            this.historyService.createHistory(history);
            historyList.push(history);
        }
        // this.historyService.createHistory(history);
        return historyList;
    }

    async handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean> {
        let gameIsEnded = false;
        const foundDifference = await this.validateClick(coord);
        const playerName = this.getPlayerData(playerSocket).name;

        if (foundDifference) {
            this.incrementPlayerDifferenceCount(playerSocket);
            this.server
                .to(room)
                .emit('success', JSON.stringify({ socketId: playerSocket.id, differences: foundDifference, pseudo: playerName } as SuccessClick));

            gameIsEnded = this.isGameEnded();
            if (gameIsEnded) {
                const position = await this.saveWinner(this.winnerSocket);
                this.server.to(room).emit('winner', JSON.stringify({ socketId: this.winnerSocket.id, leaderboardPosition: position } as Winner));
                this.stopTimer();
                const newGameHistory = await this.addHistory(this.winnerSocket.id);
                await this.updateLevelAndRank(this.winnerSocket.id);
                this.server.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
            }
        } else {
            playerSocket.emit('error', JSON.stringify(coord));
        }

        return gameIsEnded;
    }

    incrementPlayerDifferenceCount(playerSocket: Socket) {
        this.playerData.forEach((playerData) => {
            if (playerData.socket === playerSocket) {
                playerData.foundDifferencesCount++;
            }
        });
    }

    startTimer(room: string): void {
        if (!this.gameTimer.timer) {
            this.gameTimer.counter = this.constants.initial;
            this.room = room;
            let increment = true;
            this.gameTimer.timer = setInterval(async () => {
                if (this.gameTimer.counter === 0) await this.endGame(false);
                this.server.to(room).emit('clock', this.gameTimer.counter.toString());
                if (increment) this.gameTimer.counter--;
                increment = !increment;
            }, TIMER_INTERVAL);
        }
    }

    stopTimer(): void {
        clearInterval(this.gameTimer.timer);
        const endTime = new Date().getTime();
        this.timeLength = (endTime - this.timestampStart.getTime()) / TIME_DIVIDE_FACTOR;
    }

    // Cette fonction ne sert a rien, mais je dois l'appeler dans gameManagerService -> startGame tout de suite apres
    // avoir créé les services (donner le temps au client léger d'initialiser les images)
    // eslint-disable-next-line no-unused-vars
    async initCards(isObserver: boolean): Promise<void> {
        return;
    }

    async start(): Promise<void> {
        this.card = await this.cardService.getCard(this.playerData[FIRST_PLAYER].cardId);
        this.server.to(this.room).emit('constants', JSON.stringify(this.constants as GameConstants));
        this.differencesFound = new Array<Coordinate[]>();
        this.totalDifferenceCount = this.card.differences.length;
    }

    async saveWinner(playerSocket: Socket): Promise<number> {
        const winnerTime = this.gameTimer.counter;
        const player = this.getPlayerData(playerSocket);
        const winnerStat: PlayerStats = {
            cardId: this.card.id,
            firstMode: playerSocket.data.firstMode,
            secondMode: playerSocket.data.secondMode,
            playerName: player.name,
            score: winnerTime,
        } as PlayerStats;
        const position = await this.statService.addStat(winnerStat);
        const stats = await this.statService.getCardStats(this.card.id);
        this.cardService.updateClientStats({
            id: this.card.id,
            stats: stats as CardStats,
        } as Card);

        return position === POSITION_NOT_VALID ? null : position;
    }

    private async validateClick(coord: Coordinate): Promise<Coordinate[]> {
        const coords = await this.cardService.getDifferenceFromPixel(this.card.id, coord, this.card.differences);
        if (coords && !this.isAlreadyFound(coords)) {
            this.differencesFound.push(coords);
            return coords;
        }
        return null;
    }

    private isAlreadyFound(differenceArray: Coordinate[]) {
        return (
            this.differencesFound.length !== 0 &&
            this.differencesFound.some((difference: Coordinate[]) => {
                return difference[0].x === Number(differenceArray[0].x) && difference[0].y === Number(differenceArray[0].y);
            })
        );
    }

    private async endGame(isWinner: boolean, playerSocketId: string = ' ') {
        this.server.to(this.room).emit('endGame', JSON.stringify(isWinner));
        this.stopTimer();
        const newGameHistory = await this.addHistory(playerSocketId);
        if (this.winnerSocket && this.winnerSocket.id) await this.updateLevelAndRank(this.winnerSocket.id);
        this.server.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
    }

    private playerCanStillWin(totalDifferencesRemaining: number, bestPlayerScore: number, playerScore: number): boolean {
        const maxScorePlayerCanAchieve = playerScore + totalDifferencesRemaining;
        return maxScorePlayerCanAchieve > bestPlayerScore;
    }
}
