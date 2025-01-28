import { Coordinate } from './coordinates';

export interface SuccessClick {
    socketId: string;
    pseudo: string;
    differences: Coordinate[];
}