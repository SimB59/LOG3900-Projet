export enum Message {
    HostReject = "L'hôte de la partie a rejeté votre demande.",
    HostLeft = "L'hôte de la partie a quitté la création de partie.",
    HostChoseOther = "L'hôte a choisi un autre joueur pour la partie. Veuillez réessayer.",
    CardDeleted = 'The card for the current waiting room has been deleted',
}

export interface Lobby {
    players: string[];
    lobbyType: LobbyType;
}

export const enum LobbyType {
    PUBLIC = 'public',
    FRIENDS = 'friends',
    // Acceptable because we need this naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FRIENDS_OF_FRIENDS = 'friends of friends',
}

export const stringToLobbyType = (value: string): LobbyType => {
    switch (value) {
        case 'public':
            return LobbyType.PUBLIC;
        case 'friends':
            return LobbyType.FRIENDS;
        case 'friends of friends':
            return LobbyType.FRIENDS_OF_FRIENDS;
        default:
            throw new Error('Invalid Lobby Type');
    }
};

export interface CardLobby {
    lobbyId: number;
    players: string[];
}

export interface CardLobbyV2 {
    cardId: string;
    players: string[];
}

export interface ObserverGame {
    cardId: string;
    playerCount: number;
    observerCount: number;
    players: string[];
}

export interface ObservableGame {
    gameRoomName: string;
    cardId: string;
    playerCount: number;
    observerCount: number;
    players: string[];
}
