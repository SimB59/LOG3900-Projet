import { GameHistory } from '@app/model/database/game-history';
import { PlayerData } from '@app/model/interfaces/player-data';
import { Coordinate } from '@common/coordinates';
import { LimitedTimeIO } from '@common/limited-time-io';
import { Socket } from 'socket.io';

export const FIRST_PLAYER = 0;
export const SECOND_PLAYER = 1;
export const POSITION_NOT_VALID = -1;
export const LANGUAGE = 'fr-CA';
export const TIMEZONE = { timeZone: 'America/Montreal' };

export interface GameMode {
    differencesFound: Coordinate[][];
    players: PlayerData[];
    currentGame?(): LimitedTimeIO;
    getPlayerData(playerSocket: Socket): PlayerData;
    startTimer(room: string);
    stopTimer();
    start();
    initCards(isObserver: boolean): Promise<void>;
    setSurrenderSocketId(surrenderSocketId: string);
    isGameEnded(): boolean;
    isStillPlaying(): boolean;
    handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean>;
    removePlayer(playerSocket: Socket);
    incrementPlayerDifferenceCount?(playerSocket: Socket);
    saveWinner?(playerSocket: Socket): Promise<number>;
    addHistory(winner: string): Promise<GameHistory[]>;
}
