import { GameConstants } from './game-constants';
import { GameEventShared } from './game-event-shared';
export interface VideoReplay {
    videoId: string;
    gameEvents: GameEventShared[],
    playerOpponentNames: string[],
    playerSharingName: string,
    cardId: string,
    constants: GameConstants;
    isPublic: boolean;
    cardName: string;
    pseudo: string;
    date: string;
    accountId: string;
    shouldDisplay: boolean; // Used to display the video in the list (only use it in heavy client side)
}
