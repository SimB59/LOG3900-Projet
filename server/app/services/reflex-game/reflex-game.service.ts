import { GameHistory } from '@app/model/database/game-history';
import { PlayerStats } from '@app/model/database/player-stats';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { Player, TIMER_INTERVAL, TIME_DIVIDE_FACTOR } from '@app/services/game-manager/game-manager.service.constants';
import { GameService } from '@app/services/game/game.service';
import { FIRST_PLAYER, GameMode, LANGUAGE, POSITION_NOT_VALID, TIMEZONE } from '@app/services/game/game.service.constants';
import { ReflexInitData } from '@app/services/reflex-game/reflex-game.service.constants';
import { StatsService } from '@app/services/stats/stats.service';
import { AddDifference } from '@common/add-difference';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { SuccessClick } from '@common/success-click';
import { Winner } from '@common/winner';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class ReflexGameService extends GameService implements GameMode {
    differencesFound: Coordinate[][];

    private totalDifferenceCount: number;
    private card: Card;

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
        let isFoundAllDifferences = false;
        const threshold = this.totalDifferenceCount;
        for (const player of this.playerData) {
            if (player.foundDifferencesCount >= threshold) {
                isFoundAllDifferences = true;
                break;
            }
        }
        return isFoundAllDifferences;
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
                firstMode: 'reflex',
                gameId: '',
            };
            this.historyService.createHistory(history);
            historyList.push(history);
        }
        return historyList;
    }

    async handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean> {
        let gameIsEnded = false;
        const foundDifference = await this.validateClick(coord, playerSocket);
        const playerName = this.getPlayerData(playerSocket).name;

        if (foundDifference) {
            this.incrementPlayerDifferenceCount(playerSocket);
            playerSocket.emit(
                'success',
                JSON.stringify({ socketId: playerSocket.id, differences: foundDifference, pseudo: playerName } as SuccessClick),
            );

            gameIsEnded = this.isGameEnded();
            if (gameIsEnded) {
                const position = await this.saveWinner(playerSocket);
                this.server.to(room).emit('winner', JSON.stringify({ socketId: playerSocket.id, leaderboardPosition: position } as Winner));
                this.stopTimer();
                const newGameHistory = await this.addHistory(playerSocket.id);
                // }
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
            } else if (playerData.foundDifferencesCount > 0) {
                playerData.foundDifferencesCount--;
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
        const players: Player[] = [];
        this.playerData.forEach((playerData) => {
            playerData.differencesFound = new Array<Coordinate[]>();
            playerData.differencesFoundIndices = new Array<number>();
            const player: Player = { pseudo: playerData.name, socketId: playerData.socket.id };
            players.push(player);
        });
        this.totalDifferenceCount = this.card.differences.length;

        this.addInitialDifferences();
        const reflexInitData: ReflexInitData = { players, initialDifferences: this.playerData[0].differencesFound };
        this.server.to(this.room).emit('reflexInit', JSON.stringify(reflexInitData));
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

    getTotalDifferenceCount(): number {
        return this.totalDifferenceCount;
    }

    private getOpponentPlayerSocket(playerSocket: Socket): Socket {
        for (const playerData of this.playerData) {
            if (playerData.socket !== playerSocket) {
                return playerData.socket;
            }
        }
        return undefined;
    }

    private async validateClick(coord: Coordinate, playerSocket: Socket): Promise<Coordinate[]> {
        const coords = await this.cardService.getDifferenceFromPixel(this.card.id, coord, this.card.differences);
        const playerData: PlayerData = this.getPlayerData(playerSocket);
        if (coords && !this.isAlreadyFound(coords, playerData.differencesFound)) {
            playerData.differencesFound.push(coords);
            const differencesFoundIndex: number = this.card.differences.indexOf(coords);
            playerData.differencesFoundIndices.push(differencesFoundIndex);

            const opponentSocket = this.getOpponentPlayerSocket(playerSocket);
            this.removeRandomDifferenceOpponent(opponentSocket);
            return coords;
        }
        return null;
    }

    private isAlreadyFound(differenceArray: Coordinate[], differencesFound: Coordinate[][]) {
        return (
            differencesFound.length !== 0 &&
            differencesFound.some((difference: Coordinate[]) => {
                return difference[0].x === Number(differenceArray[0].x) && difference[0].y === Number(differenceArray[0].y);
            })
        );
    }

    private isAlreadyFoundFromIndex(indexArray: number[], index: number) {
        return indexArray.includes(index);
    }

    private async endGame(isWinner: boolean, playerSocketId: string = ' ') {
        this.server.to(this.room).emit('endGame', JSON.stringify(isWinner));
        this.stopTimer();
        const newGameHistory = await this.addHistory(playerSocketId);
        this.server.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
    }

    private addInitialDifferences() {
        const initialNumberOfDifferences: number = Math.ceil(this.totalDifferenceCount / 2 + 1);
        const numberOfDifferencesFoundToAdd: number = this.totalDifferenceCount - initialNumberOfDifferences;
        const indices: number[] = [];
        for (let i = 0; i <= this.totalDifferenceCount; i++) {
            indices.push(i);
        }
        for (let i = 0; i < numberOfDifferencesFoundToAdd; i++) {
            const differenceIndexToAdd = Math.floor(Math.random() * (this.totalDifferenceCount - i));
            this.playerData.forEach((playerData) => {
                playerData.differencesFound.push(this.card.differences[indices[differenceIndexToAdd]]);
                playerData.differencesFoundIndices.push(indices[differenceIndexToAdd]);
            });
            indices.splice(differenceIndexToAdd, 1);
        }
        this.playerData.forEach((playerData) => {
            playerData.foundDifferencesCount = numberOfDifferencesFoundToAdd;
        });
    }

    private removeRandomDifferenceOpponent(opponentSocket: Socket): void {
        const opponentPlayerData: PlayerData = this.getPlayerData(opponentSocket);
        if (opponentPlayerData.foundDifferencesCount > 0) {
            let isIndexFound = false;
            while (!isIndexFound) {
                const index = Math.floor(Math.random() * this.totalDifferenceCount);
                if (this.isAlreadyFoundFromIndex(opponentPlayerData.differencesFoundIndices, index)) {
                    const difference: Coordinate[] = this.card.differences[index];
                    const differenceIndexInFoundDifferences: number = opponentPlayerData.differencesFound.indexOf(difference);
                    opponentPlayerData.differencesFound.splice(differenceIndexInFoundDifferences, 1);
                    opponentPlayerData.differencesFoundIndices.splice(differenceIndexInFoundDifferences, 1);

                    const playerName = this.getPlayerData(opponentSocket).name;

                    opponentSocket.emit(
                        'addDifference',
                        JSON.stringify({ socketId: opponentSocket.id, addedDifference: difference, pseudo: playerName } as AddDifference),
                    );

                    isIndexFound = true;
                }
            }
        } else {
            opponentSocket.emit('opponentIncrement');
        }
    }
}
