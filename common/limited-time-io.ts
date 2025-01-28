import { Card } from './card';


export interface LimitedTimeIO {
    card: Card;
    differenceIndex: number;
}

export interface LimitedTimeInitIO {
    cards: Card[];
    differenceIndices: number[];
}
