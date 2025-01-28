import { NAMESPACE } from '@app/gateways/account-manager/account-manager.gateway.constants';
import { AccountService } from '@app/services/account/account.service';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { FriendService } from '@app/services/friends/friends.service';
import { Friend } from '@common/friend';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: NAMESPACE, cors: true })
@Injectable()
export class AccountManagerGateway {
    @WebSocketServer()
    private serverSocket: Server;

    constructor(
        private readonly friendService: FriendService,
        private readonly accountService: AccountService,
        private readonly authService: AuthenticationService,
    ) {}

    @SubscribeMessage('connection')
    async handleConnection(playerSocket: Socket): Promise<void> {
        this.accountService.handleConnection(playerSocket);
        this.friendService.getFriendData(this.authService.socketStore.get(playerSocket.id));
    }

    @SubscribeMessage('disconnect')
    async handleDisconnect(playerSocket: Socket) {
        await this.authService.logoutUserBySocket(playerSocket.id);
        this.accountService.handleDisconnect(playerSocket);
    }

    @SubscribeMessage('sendFriendRequest')
    // SocketData has to be [sender, receiver]
    async handleSentRequest(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as Friend[];
        const accountFriendsData = await this.friendService.sentFriendRequest(data[0], data[1]);
        const player2SocketId = this.authService.getSocketByAccountId(data[1].accountId);
        if (player2SocketId !== '') {
            const playerSocket = this.accountService.getSocketById(player2SocketId);
            playerSocket.emit('updateFriendList', JSON.stringify(accountFriendsData[1]));
        }
        socket.emit('accountFriendRequestUpdated', JSON.stringify(accountFriendsData[0]));
    }

    @SubscribeMessage('removeFriend')
    // SocketData has to be [sender, friendToRemove]
    async handleFriendRemoval(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as Friend[];
        const accountFriendsData = await this.friendService.removeFriend(data[0], data[1]);
        const player2SocketId = this.authService.getSocketByAccountId(data[1].accountId);
        if (player2SocketId !== '') {
            const playerSocket = this.accountService.getSocketById(player2SocketId);
            playerSocket.emit('updateFriendList', JSON.stringify(accountFriendsData[1]));
        }
        this.serverSocket.emit('updateFriendsOfFriendsNow', '');
        socket.emit('accountFriendListUpdated', JSON.stringify(accountFriendsData[0]));
    }

    @SubscribeMessage('sendBlockDemand')
    // SocketData has to be [sender, friendToBlock]
    async handleSentBlock(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as Friend[];
        const accountFriendsData = await this.friendService.sentBlockDemand(data[0], data[1]);
        const player2SocketId = this.authService.getSocketByAccountId(data[1].accountId);
        if (player2SocketId !== '') {
            const playerSocket = this.accountService.getSocketById(player2SocketId);
            playerSocket.emit('updateFriendList', JSON.stringify(accountFriendsData[1]));
            playerSocket.emit('updateViewingPlayers', JSON.stringify(accountFriendsData[0].accountId));
        }
        this.serverSocket.emit('updateFriendsOfFriendsNow', '');
        socket.emit('updateBlockedList', JSON.stringify(accountFriendsData[0]));
    }

    @SubscribeMessage('sendUnBlockDemand')
    // SocketData has to be [sender, friendToUnblock]
    async handleSentUnBlock(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as Friend[];
        const accountFriendsData = await this.friendService.sentUnBlockDemand(data[0], data[1]);
        const player2SocketId = this.authService.getSocketByAccountId(data[1].accountId);
        if (player2SocketId !== '') {
            const playerSocket = this.accountService.getSocketById(player2SocketId);
            playerSocket.emit('updateFriendList', JSON.stringify(accountFriendsData[1]));
        }
        socket.emit('updateBlockedList', JSON.stringify(accountFriendsData[0]));
    }

    @SubscribeMessage('acceptReceivedFriendRequest')
    // SocketData has to be [self as Friend, friend as Friend]
    async handleAcceptFriend(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as Friend[];
        const accountFriendsData = await this.friendService.actOnFriendRequestReceived(data[0], data[1], true);
        const player2SocketId = this.authService.getSocketByAccountId(data[1].accountId);
        if (player2SocketId !== '') {
            const playerSocket = this.accountService.getSocketById(player2SocketId);
            playerSocket.emit('updateFriendList', JSON.stringify(accountFriendsData[1]));
        }
        this.serverSocket.emit('updateFriendsOfFriendsNow', '');
        socket.emit('accountFriendRequestAnswerUpdated', JSON.stringify(accountFriendsData[0]));
    }

    @SubscribeMessage('refuseReceivedFriendRequest')
    // SocketData has to be [self as Friend, wannaBeFriend as Friend]
    async handleRefuseFriend(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as Friend[];
        const accountFriendsData = await this.friendService.actOnFriendRequestReceived(data[0], data[1], false);
        const player2SocketId = this.authService.getSocketByAccountId(data[1].accountId);
        if (player2SocketId !== '') {
            const playerSocket = this.accountService.getSocketById(player2SocketId);
            playerSocket.emit('updateFriendList', JSON.stringify(accountFriendsData[1]));
        }
        socket.emit('accountFriendRequestAnswerUpdated', JSON.stringify(accountFriendsData[0]));
    }

    @SubscribeMessage('searchPlayers')
    // SocketData has to be [searchedPseudo, selfAccountId]
    async handleSearchPlayers(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData);
        const accountData = await this.friendService.searchPlayers(data[0], data[1]);
        socket.emit('playersFound', JSON.stringify(accountData));
    }

    @SubscribeMessage('getAccountFriends')
    // SocketData has to be [whoseFriendsAreWeLookingAccountId, selfAccountId]
    async handleGetAccountFriends(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData);
        const accountFriendsData = await this.friendService.getAccountFriends(data[0], data[1]);
        socket.emit('accountFriendsFound', JSON.stringify(accountFriendsData));
    }

    @SubscribeMessage('updateFriendsOfFriends')
    async handleFriendsOfFriends(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const accountData = await this.friendService.getFriendsOfFriends(socketData);
        socket.emit('friendsOfFriendsFound', JSON.stringify(accountData));
    }

    @SubscribeMessage('getFriendRequests')
    async handleGetFriendRequests(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const friendRequestData = await this.friendService.getFriendRequests(socketData);
        socket.emit('friendRequestsFound', JSON.stringify(friendRequestData));
    }

    @SubscribeMessage('updateAccountFriendData')
    async handleUpdateAccountFriendData(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const friendData = await this.friendService.getFriendData(socketData);
        socket.emit('accountFriendDataFound', JSON.stringify(friendData));
    }

    @SubscribeMessage('getFriends')
    async handleGetFriends(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const data = JSON.parse(socketData) as string[];
        const accountFriendsData = await this.friendService.getFriends(data[0], data[1]);
        socket.emit('friendsFound', JSON.stringify(accountFriendsData));
    }

    @SubscribeMessage('getAccountActivity')
    async handleGetAccountActivity(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const accountActivityData = await this.friendService.getAccountActivity(socketData);
        socket.emit('accountActivityFound', JSON.stringify(accountActivityData));
    }

    @SubscribeMessage('getGameHistory')
    async handleGetGameHistory(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const accountHistoryData = await this.friendService.getGameHistory(socketData);
        socket.emit('accountGameHistoryFound', JSON.stringify(accountHistoryData));
    }

    @SubscribeMessage('getProfileData')
    async handleGetProfileData(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const accountData = await this.friendService.getPlayerProfile(socketData);
        socket.emit('profileDataFound', JSON.stringify(accountData));
    }

    @SubscribeMessage('getRank')
    async handleGetRank(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string) {
        const rank = await this.accountService.getRankByPseudo(socketData);
        socket.emit('setRank', JSON.stringify({ pseudo: socketData, rank }));
    }
}
