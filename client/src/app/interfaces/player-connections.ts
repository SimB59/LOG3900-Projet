export enum ConnectionType {
    LOGIN = 'login',
    LOGOUT = 'logout',
}

export interface PlayerConnections {
    accountId: string;
    date: string;
    time: string;
    connectionType: ConnectionType;
}
