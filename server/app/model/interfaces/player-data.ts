import { Coordinate } from '@common/coordinates';
import { Socket } from 'socket.io';

export interface PlayerData {
    name: string;
    foundDifferencesCount: number;
    socket: Socket;
    timerValue: number;
    cardId: string;
    differencesFound: Coordinate[][];
    differencesFoundIndices: number[];
}
