export interface ChatEntry {
    message: string;
    timestamp: string;
    type: ChatEntryType;
    playerName: string;
}

export enum ChatEntryType {
    USER = 0,
    EVENT = 1,
    GLOBAL = 2,
    SELF = 3,
    OPPONENT = 4,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GLOBAL_CHAT = 5,
}
