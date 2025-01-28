import { ChatEntry } from '@common/chatbox-message';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NAMESPACE } from './chat-manager.gateway.constants';

@WebSocketGateway({ namespace: NAMESPACE, cors: true })
@Injectable()
export class ChatManagerGateway {
    @WebSocketServer()
    private serverSocket: Server;

    @SubscribeMessage('message')
    private async handleMessageEvent(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string[]): Promise<void> {
        const date = new Date();
        const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZone: 'America/Montreal',
        });
        const tempSocketData = JSON.parse(socketData as unknown as string) as ChatEntry;
        tempSocketData.timestamp = formattedTime;
        this.serverSocket.emit('message', JSON.stringify(tempSocketData));
    }
}
