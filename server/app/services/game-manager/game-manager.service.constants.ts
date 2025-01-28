import { Coordinate } from '@common/coordinates';

export const TIMER_INTERVAL = 500;
export const TIME_DIVIDE_FACTOR = 1000;

export const LIMITED = 'Limited';

export const enum FirstGameMode {
    CLASSIC = 'classique',
    // Acceptable because we need this naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    LIMITED_TIME = 'Temps limité',
    REFLEX = 'reflex',
}

export const enum LobbyType {
    PUBLIC = 'public',
    FRIENDS = 'friends',
    // Acceptable because we need this naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FRIENDS_OF_FRIENDS = 'friends of friends',
}

export const stringToLobbyType = (value: string): LobbyType | undefined => {
    const enumValues: LobbyType[] = [LobbyType.PUBLIC, LobbyType.FRIENDS, LobbyType.FRIENDS_OF_FRIENDS];

    for (const enumValue of enumValues) {
        if (enumValue === value) {
            return enumValue;
        }
    }
    return undefined;
};

export interface Player {
    pseudo: string;
    socketId: string;
}

export interface Lobby {
    players: Player[];
    lobbyType: LobbyType;
}

export interface ObservableGame {
    gameRoomName: string;
    cardId: string;
    playerCount: number;
    observerCount: number;
    players: string[];
}

export interface ObserverInteractionInfo {
    coords: Coordinate[];
    senderId: string;
    isRightSide: boolean;
}
