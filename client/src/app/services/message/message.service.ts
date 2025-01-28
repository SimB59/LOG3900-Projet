import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    messageSubject: Subject<ChatEntry>;
    private gameMessages: ChatEntry[];
    private globalMessages: ChatEntry[];

    constructor(private socketService: SocketClientService) {
        this.messageSubject = new Subject<ChatEntry>();
        this.handleSocket();
        this.gameMessages = new Array();
        this.globalMessages = new Array();
    }

    getMessages(): ChatEntry[] {
        return this.gameMessages;
    }

    getGlobalMessages(): ChatEntry[] {
        return this.globalMessages;
    }

    addMessage(newMessage: ChatEntry, isGlobal: boolean, playerName: string): void {
        if (isGlobal) {
            if (newMessage.playerName === playerName) newMessage.type = ChatEntryType.SELF;
            this.globalMessages.unshift(newMessage);
        } else this.gameMessages.unshift(newMessage);
    }

    clearMessageGlobal(): void {
        this.globalMessages = [];
    }

    clearMessages(): void {
        this.gameMessages = [];
    }

    // eslint-disable-next-line max-params
    sendMessage(message: string, name: string, isGlobal: boolean, isLobby: boolean) {
        const data: ChatEntry = {
            message,
            timestamp: new Date().toLocaleTimeString(),
            type: isLobby ? ChatEntryType.LOBBY : ChatEntryType.USER,
            playerName: name,
        };
        this.socketService.sendChat('message', data, isGlobal);
    }

    stringValueOfChatEntryType(type: number): string {
        switch (type) {
            case ChatEntryType.USER:
                return 'user';
            case ChatEntryType.SELF:
                return 'self';
            case ChatEntryType.LOBBY:
                return 'lobby';
            case ChatEntryType.GLOBAL:
                return 'global';
            case ChatEntryType.GLOBAL_CHAT:
                return 'global_chat';
            default:
                return 'opponent';
        }
    }

    numberValueOfChatEntryType(type: string): number {
        switch (type) {
            case 'user':
                return ChatEntryType.USER;
            case 'self':
                return ChatEntryType.SELF;
            case 'lobby':
                return ChatEntryType.LOBBY;
            case 'global':
                return ChatEntryType.GLOBAL;
            case 'global_chat':
                return ChatEntryType.GLOBAL_CHAT;
            default:
                return ChatEntryType.OPPONENT;
        }
    }

    private handleSocket() {
        this.socketService.addCallbackToMessage('message', (data) => {
            const chat = JSON.parse(data as string) as ChatEntry;
            this.messageSubject.next(chat);
        });
        this.socketService.addCallbackToMessageChatSocket('message', (data) => {
            const chat = JSON.parse(data as string) as ChatEntry;
            chat.type = ChatEntryType.GLOBAL_CHAT;
            this.messageSubject.next(chat);
        });
    }
}
