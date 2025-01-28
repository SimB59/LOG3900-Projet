import { GameHistory } from '@app/model/database/game-history';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { TIMER_INTERVAL, TIME_DIVIDE_FACTOR } from '@app/services/game-manager/game-manager.service.constants';
import { GameService } from '@app/services/game/game.service';
import { GameMode, LANGUAGE, TIMEZONE } from '@app/services/game/game.service.constants';
import { TIMER_MAX_VALUE } from '@app/services/limited-time-game/limited-time-game.service.constants';
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { LimitedTimeIO, LimitedTimeInitIO } from '@common/limited-time-io';
import { SuccessClick } from '@common/success-click';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class LimitedTimeGameService extends GameService implements GameMode {
    differencesFound: Coordinate[][];
    differenceFoundCount: number;
    private currentCardIndex: number;
    private cards: Card[];
    private differenceIndices: number[];
    private gameIsEnded: boolean;

    // Ok to disable because service needs all parameters to function
    // eslint-disable-next-line max-params
    constructor(server: Server, cardService: CardService, players: PlayerData[], constants: GameConstants, dbService: DatabaseService) {
        super(server, cardService, players, constants, dbService);
        this.currentCardIndex = 0;
        this.differenceFoundCount = 0;
        this.gameIsEnded = false;
        this.gameTimer = { timer: null, counter: TIMER_MAX_VALUE };
    }

    get currentCard(): Card {
        return this.cards[this.currentCardIndex];
    }

    currentGame(): LimitedTimeIO {
        return { card: this.currentCard as Card, differenceIndex: this.differenceIndices[this.currentCardIndex] };
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
                firstMode: 'Temps limité',
                gameId: '',
            };
            this.historyService.createHistory(history);
            historyList.push(history);
        }
        // this.historyService.createHistory(history);
        return historyList;
    }

    async start() {
        await this.generateRandomCardsOrder();
        this.generateDifferenceIndices();
        const limitedTimeInitIO: LimitedTimeInitIO = { cards: this.cards, differenceIndices: this.differenceIndices };
        this.server.to(this.room).emit('limitedTimeInit', JSON.stringify(limitedTimeInitIO));
        const limitedTimeIO: LimitedTimeIO = { card: this.currentCard as Card, differenceIndex: this.differenceIndices[this.currentCardIndex] };
        this.server.to(this.room).emit('cardChange', JSON.stringify(limitedTimeIO));
        this.server.to(this.room).emit('constants', JSON.stringify(this.constants as GameConstants));
    }

    async initCards(isObserver: boolean): Promise<void> {
        if (!isObserver) {
            await this.generateRandomCardsOrder();
            this.generateDifferenceIndices();
        }
        const limitedTimeInitIO: LimitedTimeInitIO = { cards: this.cards, differenceIndices: this.differenceIndices };
        this.server.to(this.room).emit('limitedTimeInit', JSON.stringify(limitedTimeInitIO));
    }

    isGameEnded(): boolean {
        return this.gameIsEnded;
    }

    async handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean> {
        const coords = await this.cardService.getDifferenceFromPixelLimitedTime(
            coord,
            this.currentCard.differences[this.differenceIndices[this.currentCardIndex]],
        );
        const playerName = this.getPlayerData(playerSocket).name;
        if (coords) {
            this.currentCardIndex++;
            this.differenceFoundCount++;
            this.server
                .to(room)
                .emit('success', JSON.stringify({ socketId: playerSocket.id, differences: coords, pseudo: playerName } as SuccessClick));
            this.playerData.forEach((player) => {
                player.foundDifferencesCount++;
            });

            if (this.currentCardIndex !== this.cards.length) {
                const limitedTimeIO: LimitedTimeIO = {
                    card: this.currentCard as Card,
                    differenceIndex: this.differenceIndices[this.currentCardIndex],
                };
                this.server.to(this.room).emit('cardChange', JSON.stringify(limitedTimeIO));
                this.gameTimer.counter += this.constants.gain;
                if (this.gameTimer.counter > TIMER_MAX_VALUE) this.gameTimer.counter = TIMER_MAX_VALUE;
            } else {
                await this.endGame(true, playerSocket.id);
            }
        } else {
            playerSocket.emit('error', JSON.stringify(coord));
            this.gameTimer.counter -= this.constants.penalty;
            if (this.gameTimer.counter < 0) this.gameTimer.counter = 0;
            // this.server.to(room).emit('message', JSON.stringify({ message: 'Erreur par ' + playerName, type: ChatEntryType.EVENT } as ChatEntry));
        }

        return this.gameIsEnded;
    }

    startTimer(room: string) {
        if (!this.gameTimer.timer) {
            this.gameTimer.counter = this.constants.initial;
            this.room = room;
            let increment = true;
            this.gameTimer.timer = setInterval(async () => {
                if (this.gameTimer.counter <= 0) await this.endGame(false);
                this.server.to(room).emit('clock', this.gameTimer.counter.toString());
                if (increment) this.gameTimer.counter--;
                increment = !increment;
            }, TIMER_INTERVAL);
        }
    }

    stopTimer() {
        clearInterval(this.gameTimer.timer);
        const endTime = new Date().getTime();
        this.timeLength = (endTime - this.timestampStart.getTime()) / TIME_DIVIDE_FACTOR;
    }

    private async generateRandomCardsOrder() {
        // Algorithm source : https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        this.cards = (await this.cardService.getAllActiveCards())
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    private generateDifferenceIndices(): void {
        this.differenceIndices = [];
        for (const card of this.cards) {
            const numberOfDifferences = card.differences.length;
            const index = Math.floor(Math.random() * numberOfDifferences);
            this.differenceIndices.push(index);
        }
    }

    private async endGame(isWinner: boolean, playerSocketId: string = ' ') {
        this.server.to(this.room).emit('endGame', JSON.stringify(isWinner));
        this.gameIsEnded = true;
        this.stopTimer();
        const newGameHistorys = await this.addHistory(playerSocketId);
        for (const history of newGameHistorys) {
            this.server.emit('historyChanged', JSON.stringify({ history }));
        }
    }
}
