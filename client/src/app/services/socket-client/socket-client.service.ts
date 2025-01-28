/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NgZone } from '@angular/core';
import { ChatEntry } from '@common/chatbox-message';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    private gameSocket: Socket;
    private cardSocket: Socket;
    private chatSocket: Socket;
    private accountSocket: Socket;
    private videoReplaySocket: Socket;
    private ipcRenderer: any;

    constructor(private ngZone: NgZone) {
        if ((window as any).require) {
            try {
                this.ipcRenderer = (window as any).require('electron').ipcRenderer;
                this.listenForAppClose();
            } catch (e) {
                // console.error('Could not load electron ipc');
            }
        } else {
            // console.warn('Electron ipc not available');
        }
        this.connect();
    }

    get socketId() {
        return this.gameSocket.id;
    }

    get chatSocketId() {
        return this.chatSocket.id;
    }

    get accountSocketId() {
        return this.accountSocket.id;
    }

    connect() {
        this.gameSocket = io(`${environment.serverUrl}/game`, { transports: ['websocket'] });
        this.cardSocket = io(`${environment.serverUrl}/cards`, { transports: ['websocket'] });
        this.chatSocket = io(`${environment.serverUrl}/chat`, { transports: ['websocket'] });
        this.accountSocket = io(`${environment.serverUrl}/account`, { transports: ['websocket'] });
        this.videoReplaySocket = io(`${environment.serverUrl}/video-replay`, { transports: ['websocket'] });
        this.gameSocket.send('connection');
    }

    disconnectAll() {
        this.gameSocket.disconnect();
        this.cardSocket.disconnect();
        this.chatSocket.disconnect();
        this.accountSocket.disconnect();
        this.videoReplaySocket.disconnect();
    }

    listenForAppClose() {
        this.ipcRenderer.on('app-close', () => {
            this.ngZone.run(() => {
                this.disconnectAll();
            });
        });
    }

    send(event: string, data?: string): void {
        if (data) this.gameSocket.emit(event, data);
        else this.gameSocket.emit(event);
    }

    sendChat(event: string, data: ChatEntry = {} as ChatEntry, isGlobal: boolean): void {
        if (!isGlobal) this.gameSocket.emit(event, JSON.stringify(data));
        else this.chatSocket.emit(event, JSON.stringify(data));
    }

    sendAccountInfo(event: string, data: string): void {
        this.accountSocket.emit(event, data);
    }

    sendVideoReplayRequest(event: string, data: string): void {
        this.videoReplaySocket.emit(event, data);
    }

    addCallbackToMessage(message: string, callback: (data: unknown) => void, isGameSocket: boolean = true) {
        if (isGameSocket) this.gameSocket.on(message, callback);
        else this.cardSocket.on(message, callback);
    }

    addCallbackToMessageChatSocket(message: string, callback: (data: unknown) => void) {
        this.chatSocket.on(message, callback);
    }

    addCallbackToMessageAccountSocket(message: string, callback: (data: unknown) => void) {
        this.accountSocket.on(message, callback);
    }

    addCallbackToMessageVideoReplaySocket(message: string, callback: (data: unknown) => void) {
        this.videoReplaySocket.on(message, callback);
    }
}
