/* eslint-disable */
import { NAMESPACE } from '@app/gateways/game-manager/game-manager.gateway.constants';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { FirstGameMode } from '@app/services/game-manager/game-manager.service.constants';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: NAMESPACE, cors: true })
@Injectable()
export class GameManagerGateway implements OnGatewayInit {
    @WebSocketServer()
    private serverSocket: Server;

    constructor(private readonly gameManagerService: GameManagerService) {}

    @SubscribeMessage('disconnect')
    async handleDisconnect(playerSocket: Socket) {
        this.gameManagerService.handleDisconnect(playerSocket);
    }

    @SubscribeMessage('observerInteraction')
    async handleInteraction(playerSocket: Socket, @MessageBody() socketData: string) {
        // console.log('observerInteraction socketData:');
        // console.log(socketData);
        this.gameManagerService.handleInteraction(socketData);
    }

    @SubscribeMessage('connection')
    async handleConnection(playerSocket: Socket): Promise<void> {
        this.gameManagerService.handleConnection(playerSocket);
    }

    @SubscribeMessage('message')
    private handleMessageEvent(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        if (socketData !== 'connection') {
            this.gameManagerService.handleMessageEvent(socket, socketData);
        }
    }

    @SubscribeMessage('addPlayer')
    private async addPlayer(@ConnectedSocket() playerSocket: Socket, @MessageBody() socketData: string): Promise<void> {
        this.gameManagerService.addPlayer(playerSocket, socketData);
    }

    @SubscribeMessage('addObserver')
    private async addObserver(@ConnectedSocket() playerSocket: Socket, @MessageBody() roomName: string): Promise<void> {
        this.gameManagerService.joinObserverGame(roomName, playerSocket);
    }

    @SubscribeMessage('observerQuit')
    private async removeObserver(@ConnectedSocket() playerSocket: Socket): Promise<void> {
        this.gameManagerService.removeObserverGame(playerSocket);
    }

    @SubscribeMessage('createWaitingRoom')
    private async createWaitingRoom(@ConnectedSocket() playerSocket: Socket, @MessageBody() socketData: string): Promise<void> {
        this.gameManagerService.createWaitingRoom(playerSocket, socketData);
    }

    @SubscribeMessage('surrender')
    private handleSurrender(@ConnectedSocket() playerSocket: Socket): void {
        this.gameManagerService.handleSurrender(playerSocket);
    }

    @SubscribeMessage('handleClick')
    private async handleClick(@ConnectedSocket() playerSocket: Socket, @MessageBody() clickData: string): Promise<void> {
        this.gameManagerService.handleClick(playerSocket, clickData);
    }

    @SubscribeMessage('endGame')
    private async endGame(@ConnectedSocket() playerSocket: Socket): Promise<void> {
        this.gameManagerService.endGame(playerSocket);
    }

    @SubscribeMessage('startGame')
    private handleStartGame(@MessageBody() socketData: string) {
        // socketData need to be : JSON.stringify({lobbyId: string, cardId: string, firstMode: FirstGameMode,
        // constants: {cheatIsOn: boolean, timerMax: number} as GameConstant})
        const data = JSON.parse(socketData);
        if (Number.isFinite(data.firstMode)) {
            // light client
            this.gameManagerService.startGame(data.lobbyId, data.cardId, this.getFirstGameMode(data.firstMode), data.constants);
        } else {
            // heavy client
            this.gameManagerService.startGame(data.lobbyId, data.cardId, data.firstMode, data.constants);
        }
    }

    @SubscribeMessage('joinRequestAborted')
    private handleAbortedRequest(@MessageBody() socketData: string) {
        this.gameManagerService.handleAbortedRequest(socketData);
    }

    @SubscribeMessage('updateLobbyConstants')
    private handleUpdateLobbyConstants(@MessageBody() socketData: string) {
        this.gameManagerService.handleUpdateLobbyConstants(socketData);
    }

    @SubscribeMessage('saveReplay')
    private handleSaveReplay(@MessageBody() gameEvents: string) {
        // console.log(' gameEvents de handle Subscribre', gameEvents);
        this.gameManagerService.handleSaveReplay(gameEvents);
    }

    afterInit() {
        this.gameManagerService.server = this.serverSocket;
    }

    getFirstGameMode(index: number): FirstGameMode {
        switch (index) {
            case 0:
                return FirstGameMode.CLASSIC;
            case 1:
                return FirstGameMode.LIMITED_TIME;
            case 2: 
                return FirstGameMode.REFLEX;
        }
    }
}
