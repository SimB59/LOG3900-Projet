export const NUMBER_CARD_PER_PAGE = 4;
export interface GameParameters {
    isSolo: boolean;
    isClassic: boolean;
    // lobbyType: LobbyType;
}

export const NO_MORE_CARD_AVAILABLE = 'There are no more cards available to play with';

export const enum FirstGameMode {
    CLASSIC = 'classique',
    // Acceptable because we need this naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    LIMITED_TIME = 'Limited',
}

export const enum SecondGameMode {
    SOLO = 'solo',
    VERSUS = 'versus',
}
