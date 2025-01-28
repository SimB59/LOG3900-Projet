/* eslint-disable */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountData } from '@app/interfaces/account-data';
import { AccountFriends } from '@app/interfaces/account-friends';
import { AvatarImage } from '@app/interfaces/avatar-image';
import { DataBaseAccountData } from '@app/interfaces/database-account-data';
import { GameHistory } from '@app/interfaces/game-history';
import { Language } from '@app/interfaces/language';
import { PlayerConnections } from '@app/interfaces/player-connections';
import { Theme } from '@app/interfaces/theme';
import { AlertService } from '@app/services/alert/alert.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Friend } from '@common/friend';
import { Message } from '@common/message';
import { Subject, firstValueFrom } from 'rxjs';
import { MessageService } from '../message/message.service';

const HTTP_STATUS_OK = 200;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const UNSUPPORTED_MEDIA_TYPE = 415;
const INTERNAL_SERVER_ERROR = 500;
@Injectable({
    providedIn: 'root',
})
export class AccountService {
    accountData: AccountData;
    friendsData: AccountFriends;
    accountConnections: PlayerConnections[] = [];
    accountGameHistory: GameHistory[] = [];
    externalWindow: Window | null;
    finishedLoadingSubject: Subject<boolean>;
    searchedPlayers: DataBaseAccountData[];
    profileConsulting: DataBaseAccountData;
    profileConsultingFriends: Friend[] = [];
    profileConsultingConnections: PlayerConnections[] = [];
    profileConsultingGameHistory: GameHistory[] = [];
    friendsOfFriends: Friend[] = [];
    // eslint-disable-next-line max-params
    constructor(
        protected comService: CommunicationService,
        protected socketService: SocketClientService,
        protected alertService: AlertService,
        protected translateService: TranslateService,
        protected themeService: ThemeService,
        protected messageService: MessageService
    ) {
        this.resetAccountInformation();
        this.handleSocket();
        this.finishedLoadingSubject = new Subject<boolean>();
    }

    get accountId() {
        return this.accountData.accountId;
    }

    get pseudo() {
        return this.accountData.pseudo;
    }

    get email() {
        return this.accountData.email;
    }

    get avatar() {
        if (this.accountData.avatarPicture) {
            return this.accountData.avatarPicture.imageData;
        }
        return null;
    }

    get friendsList() {
        if (!this.friendsData || !this.friendsData.friendList) {
            return [];
        }
        return this.friendsData.friendList;
    }

    get sentRequests() {
        if (!this.friendsData || !this.friendsData.requestSentList) {
            return [];
        }
        return this.friendsData.requestSentList;
    }

    get receivedRequests() {
        if (!this.friendsData || !this.friendsData.receivedRequestList) {
            return [];
        }
        return this.friendsData.receivedRequestList;
    }

    get blockedList() {
        if (!this.friendsData || !this.friendsData.blockedList) {
            return [];
        }
        return this.friendsData.blockedList;
    }

    get friendsPseudoOfFriends() {
        return this.friendsOfFriends.map((friend) => friend.pseudo);
    }

    set pseudo(pseudo: string) {
        this.accountData.pseudo = pseudo;
    }

    set email(email: string) {
        this.accountData.email = email;
    }

    aUserIsConnected(): boolean {
        return this.accountId !== undefined;
    }

    async createAccount(accountData: {
        email: string;
        pseudo: string;
        password: string;
        avatarPicture: AvatarImage;
        socketId: string;
        language: Language;
        theme: Theme;
    }): Promise<boolean> {
        const formData = new FormData();
        if (accountData.avatarPicture && accountData.avatarPicture.imageData) {
            formData.append('avatarPicture', accountData.avatarPicture.imageData);
        }
        formData.append('email', accountData.email);
        formData.append('pseudo', accountData.pseudo);
        formData.append('password', accountData.password);
        formData.append('socketId', accountData.socketId);
        formData.append('imageId', accountData.avatarPicture.imageId);
        formData.append('language', accountData.language);
        formData.append('theme', accountData.theme);
        let success = false;
        try {
            const response = await firstValueFrom(this.comService.post('account', formData));
            if (response.status === HTTP_STATUS_OK) {
                this.pseudo = accountData.pseudo;
                this.email = accountData.email;
                if (response.body) this.accountData.accountId = JSON.parse(response.body).body;
                await this.fetchAccountData();
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorMessage = JSON.parse(exception.error).body;
                if (errorMessage === 'Invalid email' || errorMessage === 'Invalid pseudo') {
                    this.alertService.generatePopUp(errorMessage, true);
                } else {
                    this.alertService.generatePopUp('Internal server error', true);
                }
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    async loginAccount(pseudo: string, password: string): Promise<boolean> {
        let success = false;
        this.messageService.clearMessageGlobal();
        this.messageService.clearMessages();
        try {
            const socketId = this.socketService.accountSocketId; // account socket id
            const response = await firstValueFrom(
                this.comService.postRequest('account/auth', {
                    title: 'loginUser',
                    body: JSON.stringify({ pseudo, password, socketId }),
                } as Message),
            );
            if (response.status === HTTP_STATUS_OK) {
                if (response.body) {
                    const information = JSON.parse(JSON.parse(response.body).body);
                    this.accountData.accountId = information.userId;
                    this.pseudo = information.pseudo;
                    this.email = information.email;
                }
                await this.fetchAccountData();
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorMessage = JSON.parse(exception.error).body;
                this.alertService.generatePopUp(errorMessage, true);
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    async disconnectAccount(): Promise<boolean> {
        let success = false;
        try {
            const response = await firstValueFrom(
                this.comService.postRequest('account/auth/logout', {
                    title: 'logoutUser',
                    body: JSON.stringify({ userId: this.accountId }),
                } as Message),
            );
            if (response.status === HTTP_STATUS_OK) {
                this.resetAccountInformation();
                this.closeChatboxWindow();
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorStatus = exception.status;
                if (errorStatus === BAD_REQUEST) {
                    this.alertService.generatePopUp('User not connected', true);
                } else if (errorStatus === INTERNAL_SERVER_ERROR) {
                    this.alertService.generatePopUp('Internal server error', true);
                } else {
                    this.alertService.generatePopUp('Failed to logout', true);
                }
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    async updatePreferences(): Promise<boolean> {
        let success = false;
        try {
            const response = await firstValueFrom(
                this.comService.postRequest('account/preferences', {
                    title: 'updatePreferences',
                    body: JSON.stringify({
                        userId: this.accountId,
                        language: this.translateService.currentLanguage,
                        theme: this.themeService.currentTheme,
                    }),
                } as Message),
            );
            if (response.status === HTTP_STATUS_OK) {
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorStatus = exception.status;
                if (errorStatus === BAD_REQUEST) {
                    this.alertService.generatePopUp('User not connected', true);
                } else {
                    this.alertService.generatePopUp('Internal server error', true);
                }
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    async saveNewAvatar(newFile: File): Promise<boolean> {  
        let success = false;
        try {
            const formData = new FormData();
            formData.append('avatarPicture', newFile);
            formData.append('userId', this.accountData.accountId);
            const response = await firstValueFrom(this.comService.post('account/update-avatar', formData));
            if (response.status === HTTP_STATUS_OK) {
                this.alertService.generatePopUp('New avatar saved successfully', false);
                this.accountData.avatarPicture.imageData = newFile;
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorStatus = exception.status;
                if (errorStatus === BAD_REQUEST) {
                    this.alertService.generatePopUp('File not provided', true);
                } else if (errorStatus === UNSUPPORTED_MEDIA_TYPE) {
                    this.alertService.generatePopUp('UNSUPPORTED_MEDIA_TYPE error message', true);
                }
                 else {
                    this.alertService.generatePopUp('Internal server error', true);
                }
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    sendFriendRequest(friendId: string, friendPseudo: string) {
        const sender = { accountId: this.accountData.accountId, pseudo: this.accountData.pseudo } as Friend;
        const receiver = { accountId: friendId, pseudo: friendPseudo } as Friend;
        this.socketService.sendAccountInfo('sendFriendRequest', JSON.stringify([sender, receiver]));
        this.alertService.generatePopUp('Friend request sent', false);
    }

    acceptFriendRequest(friend: Friend) {
        const self = { accountId: this.accountData.accountId, pseudo: this.accountData.pseudo } as Friend;
        this.socketService.sendAccountInfo('acceptReceivedFriendRequest', JSON.stringify([self, friend]));
    }

    refuseFriendRequest(friend: Friend) {
        const self = { accountId: this.accountData.accountId, pseudo: this.accountData.pseudo } as Friend;
        this.socketService.sendAccountInfo('refuseReceivedFriendRequest', JSON.stringify([self, friend]));
    }

    blockPlayer(friend: Friend) {
        const self = { accountId: this.accountData.accountId, pseudo: this.accountData.pseudo } as Friend;
        this.socketService.sendAccountInfo('sendBlockDemand', JSON.stringify([self, friend]));
    }

    unblockPlayer(friend: Friend) {
        const self = { accountId: this.accountData.accountId, pseudo: this.accountData.pseudo } as Friend;
        this.socketService.sendAccountInfo('sendUnBlockDemand', JSON.stringify([self, friend]));
    }

    removeFriend(friend: Friend) {
        const self = { accountId: this.accountData.accountId, pseudo: this.accountData.pseudo } as Friend;
        this.socketService.sendAccountInfo('removeFriend', JSON.stringify([self, friend]));
    }

    searchPlayer(searchedName: string ) {
        this.socketService.sendAccountInfo('searchPlayers', JSON.stringify([searchedName, this.accountData.accountId]));
    }

    fetchOtherPlayerData(otherAccountId: string) {
        this.socketService.sendAccountInfo('getProfileData', otherAccountId);
        this.fetchOtherPlayerFriends(otherAccountId);
        this.fetchAccountConnections(otherAccountId);
        this.fetchAccountGameHistory(otherAccountId);
    }

    fetchOtherPlayerFriends(otherAccountId: string) {
        this.socketService.sendAccountInfo('getFriends', JSON.stringify([this.accountData.accountId, otherAccountId]));
    }

    fetchAccountFriends() {
        this.socketService.sendAccountInfo('updateAccountFriendData', this.accountData.accountId);
    }

    fetchAccountConnections(accountId: string = this.accountData.accountId) {
        this.socketService.sendAccountInfo('getAccountActivity', accountId);
    }

    fetchAccountGameHistory(accountId: string = this.accountData.accountId) {
        this.socketService.sendAccountInfo('getGameHistory', accountId);
    }

    fetchFriendsOfFriends() {
        this.socketService.sendAccountInfo('updateFriendsOfFriends', this.accountData.accountId);
    }

    // accountId is the id of the account of which we want to get the friend list
    // fetchFriendsList(accountId: string = this.accountData.accountId) {
    //     this.socketService.sendAccountInfo('getAccountFriends', JSON.stringify([accountId, this.accountData.accountId]));
    //     console.log('fetching friends list');
    //     console.log(this.friendsData); // elle est vide ici alors qu'elle est censée être remplie
    // }

    async fetchAccountData() {
        if(this.pseudo) {
            const res = await firstValueFrom(this.comService.getRequest(`account/${this.pseudo}`));
        const data = JSON.parse(res.body) as AccountData;
        this.accountData = data;
        this.accountData.accountRank = this.accountData.accountRank > 2 ? 3 : this.accountData.accountRank;
        this.translateService.setLanguage(this.accountData.language);
        this.themeService.setTheme(this.accountData.theme);
        if(this.accountData.avatarPicture) this.accountData.avatarPicture.imageData = await this.fetchAvatarImage(this.accountData.avatarPicture.imageId);
        this.fetchAccountFriends();
        this.fetchAccountConnections();
        this.fetchAccountGameHistory();
        }
    }

    async fetchAvatarImage(imageId: string): Promise<File> {
        let file: File = new File([], '');
        try{
            const blob = await firstValueFrom(this.comService.getAvatarImage(`image/avatar/${imageId}`));
            const extension = '.' + blob.type.split('/')[1]; // Blob.type returns 'image/extension'
            file = new File([blob], `${this.accountData.avatarPicture.imageId}${extension}`, { type: blob.type });
        } catch (exception: HttpErrorResponse | unknown) {
            // this.alertService.generatePopUp('Error downloading your avatar', true);
        };
        return file;
    }

    closeChatboxWindow() {
        if (this.externalWindow) {
            this.externalWindow.close();
            this.externalWindow = null;
        }
    }

    async sendPasswordResetEmail(email: string, generatedCode: string): Promise<boolean> {
        let success = false;
        try {
            const response = await firstValueFrom(this.comService.post('account/send-password-email', { email, generatedCode }));
            if (response.status === HTTP_STATUS_OK) {
                this.alertService.generatePopUp('Email sent', false);
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorStatus = exception.status;
                if (errorStatus === NOT_FOUND) {
                    this.alertService.generatePopUp('No user found with this email', true);
                } else {
                    this.alertService.generatePopUp('Internal server error', true);
                }
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    async changePassword(email: string, newPassword: string) {
        const response = await firstValueFrom(this.comService.post('account/reset-password', { email, newPassword }));
        if (response.status === HTTP_STATUS_OK) {
            this.alertService.generatePopUp('Password changed', false);
            return true;
        } else {
            this.alertService.generatePopUp('Error during password change', true);
            return false;
        }
    }

    async changePseudo(newPseudo: string) {
        let success = false;
        const oldPseudo = this.accountData.pseudo;
        try {
            const response = await firstValueFrom(this.comService.post('account/pseudo', { oldPseudo, newPseudo }));
            if (response.status === HTTP_STATUS_OK) {
                this.pseudo = newPseudo;
                success = true;
            }
        } catch (exception: HttpErrorResponse | unknown) {
            if (exception instanceof HttpErrorResponse) {
                const errorStatus = exception.status;
                if (errorStatus === BAD_REQUEST) {
                    this.alertService.generatePopUp('Pseudo is not unique', true);
                } else {
                    this.alertService.generatePopUp('Internal server error', true);
                }
            } else {
                this.alertService.generatePopUp('Unknown error', true);
            }
            success = false;
        }
        return success;
    }

    isConsultingProfile(): boolean {
        return Object.keys(this.profileConsulting).length !== 0;
    }

    resetOtherPlayerData() {
        this.profileConsulting = {} as DataBaseAccountData;
        this.profileConsultingFriends = [] as Friend[];
        this.profileConsultingConnections = [] as PlayerConnections[];
        this.profileConsultingGameHistory = [] as GameHistory[];
    }

    private handleSocket() {
        // Was used to fetch the accountFriends data
        this.socketService.addCallbackToMessageAccountSocket('accountFriendDataFound', (data) => {
            this.friendsData = JSON.parse(data as string) as AccountFriends;
            this.fetchFriendsOfFriends();
        });
        // Called as soon as there is a modification in the accountFriends data
        this.socketService.addCallbackToMessageAccountSocket('updateFriendList', (data) => {
            this.friendsData = JSON.parse(data as string) as AccountFriends;
            // Prevent the profileConsultingFriends from showing players that blocked me if ever
            if (this.blockedList.length > 0) {
                this.profileConsultingFriends = this.profileConsultingFriends.filter(
                    (friend) => !this.blockedList.some((blocked) => blocked.accountId === friend.accountId),
                );
            }
            if(this.accountData.accountId) {
                this.fetchFriendsOfFriends();
            }
        });
        // After a search, the server sends back the list of players found
        this.socketService.addCallbackToMessageAccountSocket('playersFound', (data) => {
            this.searchedPlayers = JSON.parse(data as string) as DataBaseAccountData[];
        });
        this.socketService.addCallbackToMessageAccountSocket('accountFriendsFound', (data) => {
            this.friendsData.friendList = JSON.parse(data as string) as Friend[];
        });
        // When a friend request is sent, the server sends back the updated accountFriends data
        this.socketService.addCallbackToMessageAccountSocket('accountFriendRequestUpdated', (data) => {
            this.friendsData = JSON.parse(data as string) as AccountFriends;
        });
        // When I accept a friend request, the server sends back the updated accountFriends data
        this.socketService.addCallbackToMessageAccountSocket('accountFriendRequestAnswerUpdated', (data) => {
            this.friendsData = JSON.parse(data as string) as AccountFriends;
            this.fetchFriendsOfFriends();
        });
        // When I refuse a friend request, the server sends back the updated accountFriends data
        this.socketService.addCallbackToMessageAccountSocket('accountFriendListUpdated', (data) => {
            this.friendsData = JSON.parse(data as string) as AccountFriends;
        });
        // When i block or unblock a player, the server sends back the updated accountFriends data
        this.socketService.addCallbackToMessageAccountSocket('updateBlockedList', (data) => {
            this.friendsData = JSON.parse(data as string) as AccountFriends;
            this.fetchFriendsOfFriends();
        });
        // If I get blocked, the player who blocked me will be removed from my searchedPlayers and profileConsultingFriends
        this.socketService.addCallbackToMessageAccountSocket('updateViewingPlayers', (data) => {
            const blockedById = JSON.parse(data as string) as string;
            this.searchedPlayers = this.searchedPlayers.filter((player) => player.accountId !== blockedById);
            this.profileConsultingFriends = this.profileConsultingFriends.filter((friend) => friend.accountId !== blockedById);
        });
        // When i want to consult a profile, the server sends back the DataBaseAccountData of the player
        this.socketService.addCallbackToMessageAccountSocket('profileDataFound', (data) => {
            this.profileConsulting = JSON.parse(data as string) as DataBaseAccountData;
            console.log(JSON.parse(data as string))
            this.profileConsulting.accountRank = this.profileConsulting.accountRank > 2 ? 3 : this.profileConsulting.accountRank;
        });
        // When I want to consult the friends of a player, the server sends back the friendList of the player
        this.socketService.addCallbackToMessageAccountSocket('friendsFound', (data) => {
            this.profileConsultingFriends = JSON.parse(data as string) as Friend[];
        });
        // When I want to consult the connections of a player, the server sends back the connections of the player
        this.socketService.addCallbackToMessageAccountSocket('accountActivityFound', (data) => {
            const connections = JSON.parse(data as string) as PlayerConnections[];
            if (connections[0].accountId === this.accountData.accountId) {
                this.accountConnections = connections;
            } else if (connections[0].accountId === this.profileConsulting.accountId) {
                this.profileConsultingConnections = connections;
            }
        });
        // When I want to consult the game history of a player, the server sends back the game history of the player
        this.socketService.addCallbackToMessageAccountSocket('accountGameHistoryFound', (data) => {
            const gameHistory = JSON.parse(data as string) as GameHistory[];
            let gamesPlayed = gameHistory.length;
            let gamesWon = 0;
            let totalTime = 0;
            let totalDifference = 0;
            gameHistory.forEach((game) => {
                if(game.isWinner) gamesWon++; 
                totalTime += game.duration;
                totalDifference += game.numberOfDifferenceFound;        
            });
            let timeMeanPerGame = Math.round(totalTime / gamesPlayed);
            let meanDifferencesFoundPerGame = Math.round(totalDifference / gamesPlayed);
            if (gameHistory.length === 0) return;
            if (gameHistory[0].accountId === this.accountData.accountId) {
                this.accountGameHistory = gameHistory;
                this.accountData.accountStats = {gamesPlayed, gamesWon, timeMeanPerGame, meanDifferencesFoundPerGame};
            } else if (gameHistory[0].accountId === this.profileConsulting.accountId) {
                this.profileConsultingGameHistory = gameHistory;
                this.profileConsulting.accountStats = {gamesPlayed, gamesWon, timeMeanPerGame, meanDifferencesFoundPerGame};
            }
        });
        // When I want to consult the friends of friends, the server sends back the friendList of the friends of friends
        this.socketService.addCallbackToMessageAccountSocket('friendsOfFriendsFound', (data) => {
            this.friendsOfFriends = JSON.parse(data as string) as Friend[];
        });
        this.socketService.addCallbackToMessageAccountSocket('updateFriendsOfFriendsNow', () => {
            this.fetchFriendsOfFriends();
        });
    }

    private resetAccountInformation() {
        this.accountData = {} as AccountData;
        this.friendsData = {} as AccountFriends;
        this.accountConnections = [] as PlayerConnections[];
        this.accountGameHistory = [] as GameHistory[];
        this.searchedPlayers = [] as DataBaseAccountData[];
        this.friendsOfFriends = [] as Friend[];
        this.resetOtherPlayerData();
    }
}
