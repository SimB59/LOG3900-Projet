export interface GameHistory {
    accountId: string;
    date: string;
    time: string;
    isWinner: boolean;
    duration: number;
    numberOfDifferenceFound: number;
    firstMode: string;
    gameId: string;
}
