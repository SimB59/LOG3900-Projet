import { GameTimer } from '@app/model/interfaces/game-timer';
import { HistoryData } from '@app/model/interfaces/history-data';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { HistoryService } from '@app/services/history/history.service';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SECOND_PLAYER } from './game.service.constants';

@Injectable()
export class GameService {
    protected room: string;
    protected playerData: PlayerData[];
    protected historyData: HistoryData[];
    protected gameTimer: GameTimer;
    protected clueCounter: number;
    protected timestampStart: Date;
    protected timeLength: number;
    protected surrenderSocketId: string;

    // Ok to disable because service needs all parameters to function
    // eslint-disable-next-line max-params
    constructor(
        protected readonly server: Server,
        protected cardService: CardService,
        protected playersPlaying: PlayerData[],
        protected constants: GameConstants,
        protected dbService: DatabaseService,
        protected historyService: HistoryService = new HistoryService(dbService),
    ) {
        this.playerData = playersPlaying;
        this.timestampStart = new Date();
        this.clueCounter = 0;
        this.historyData = this.playerData.map(({ name, socket }) => Object.assign({}, { name, socketId: socket.id }));
        this.surrenderSocketId = ' ';
    }

    get players(): PlayerData[] {
        return this.playerData;
    }

    get secondPlayer(): PlayerData {
        return this.playerData[SECOND_PLAYER];
    }

    setSurrenderSocketId(surrenderSocketId: string) {
        this.surrenderSocketId = surrenderSocketId;
    }

    isStillPlaying() {
        return this.playerData.length >= 2; // Changed this to 2 because isClassical needs to end if less than 2
    }

    removePlayer(playerSocket: Socket) {
        let index = 0;
        for (let i = 0; i < this.playerData.length; i++) {
            if (this.playerData[i].socket === playerSocket) index = i;
        }
        this.playerData.splice(index, 1);
    }

    getPlayerData(player: Socket): PlayerData {
        let index = 0;
        for (let i = 0; i < this.playerData.length; i++) {
            if (this.playerData[i].socket === player) index = i;
        }

        return this.playerData[index];
    }

    protected getClueDifference(differencesArray: Coordinate[][]) {
        this.clueCounter++;
        return this.getRandomDifference(differencesArray);
    }

    private getRandomDifference(difference: Coordinate[][]): Coordinate[] {
        const randomIndex = Math.floor(Math.random() * difference.length);
        return difference[randomIndex];
    }
}
