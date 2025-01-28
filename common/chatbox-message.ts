export interface ChatEntry {
    message: string;
    timestamp: string;
    type: ChatEntryType;
    playerName: string;
}

export enum ChatEntryType {
    USER = 0,
    LOBBY = 1,
    GLOBAL = 2,
    SELF = 3,
    OPPONENT = 4,
    GLOBAL_CHAT = 5,
}
