import { Coordinate } from './coordinates';

// Same as SuccessClick, but added for naming coherence
export interface AddDifference {
    socketId: string;
    pseudo: string;
    addedDifference: Coordinate[];
}