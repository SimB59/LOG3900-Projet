import { VideoReplayService } from '@app/services/video-replay/video-replay.service';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NAMESPACE } from './video-replay.gateway.constants';

@WebSocketGateway({ namespace: NAMESPACE, cors: true })
@Injectable()
export class VideoReplayGateway {
    @WebSocketServer()
    private serverSocket: Server;

    constructor(private readonly videoReplayService: VideoReplayService) {}

    @SubscribeMessage('getVideoReplay')
    async handleGetPublicVideoReplay(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        const videoReplays = await this.videoReplayService.getVideoReplay(data);
        // console.log('receiving getVideoReplay request from : ', data);
        // console.log('videoReplays : ', videoReplays);
        this.serverSocket.to(socket.id).emit('getVideoReplay', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('searchVideoReplayCardName')
    async handleSearchVideoReplayCardName(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        // console.log('reached');
        const videoReplays = await this.videoReplayService.searchVideoReplayCardName(data);
        // console.log('reached emit');
        socket.emit('videoReplayCardNameFound', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('searchVideoReplayPlayerName')
    async handleSearchVideoReplayPlayerName(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        // console.log('reached');
        const videoReplays = await this.videoReplayService.searchVideoReplayPlayerName(data);
        this.serverSocket.to(socket.id).emit('videoReplayPlayerNameFound', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('changeVisibility')
    async handleChangeVisibility(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        const videoReplays = await this.videoReplayService.changeVisibility(data);
        socket.emit('updateVideoReplayStatus', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('changeVisibilityWithOutEmit')
    async handleCchangeVisibilityWithouEmit(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        // console.log('changeVisibilityWithOutEmit : ', data);
        await this.videoReplayService.changeVisibilityWithOutEmit(data);
        // this.serverSocket.to(socket.id).emit('getVideoReplay', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('deleteVideoReplay')
    async handleDeleteVideoReplay(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        // console.log('deleteVideoReplay : ', data);
        const videoReplays = await this.videoReplayService.deleteVideoReplay(data);
        this.serverSocket.to(socket.id).emit('getVideoReplay', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('deleteVideoReplayHeavy')
    async handleDeleteVideoReplayHeavy(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        const data2 = JSON.parse(data);
        const videoReplays = await this.videoReplayService.deleteVideoReplayHeavy(data2.videoId, data2.accountId);
        this.serverSocket.to(socket.id).emit('getVideoReplay', JSON.stringify(videoReplays));
    }

    @SubscribeMessage('getPersonalVideoReplay')
    async handleGetPersonalVideoReplay(@ConnectedSocket() socket: Socket, @MessageBody() data: string): Promise<void> {
        const videoReplays = await this.videoReplayService.getPersonalVideoReplay(data);
        socket.emit('personalVideoReplayFound', JSON.stringify(videoReplays));
    }
}
