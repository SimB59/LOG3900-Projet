/* eslint-disable */
import { Account } from '@app/model/database/account';
import { ConnectionType, PlayerConnection } from '@app/model/database/player-connection';
import { UserStats } from '@app/model/database/user-stats';
import { AccountData } from '@app/model/interfaces/account-data';
import { AccountDatabase } from '@app/model/interfaces/account-database';
import { AvatarImage } from '@app/model/interfaces/avatar-image';
import { Language } from '@app/model/interfaces/language';
import { Theme } from '@app/model/interfaces/theme';
import { DatabaseService } from '@app/services/database/database.service';
import { FileService } from '@app/services/file/file.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';
import { LANGUAGE, TIMEZONE } from '../game/game.service.constants';
import { EmailService } from '../mail/mail.service';
import { PlayerConnectionService } from '../player-connection/player-connection.service';
import { RANDOM_PARAM } from './account.service.constant';

const SALT_ROUNDS = 1;

@Injectable()
export class AccountService {
    private connectedSockets: Map<string, Socket>;
    constructor(
        private readonly databaseService: DatabaseService,
        private fileService: FileService,
        private readonly playerConnectionService: PlayerConnectionService,
        private readonly emailService: EmailService,
    ) {
        this.connectedSockets = new Map();
    }

    async handleConnection(playerSocket: Socket): Promise<void> {
        this.connectedSockets.set(playerSocket.id, playerSocket);
    }

    async handleDisconnect(playerSocket: Socket) {
        this.connectedSockets.delete(playerSocket.id);
    }

    getSocketById(accountId: string): Socket {
        // console.log('getSocketById', this.connectedSockets);
        // console.log("accountId", accountId)
        return this.connectedSockets.get(accountId);
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    async updatePassword(email: string, password: string) {
        await this.databaseService.updatePassword(email, password);
    }

    async createAccount(account: AccountData, ids: string): Promise<void> {
        // TODO : Create friend in database
        const hashedPassword = await bcrypt.hash(account.password, SALT_ROUNDS);
        const accountDoc: AccountDatabase = {
            accountId: ids,
            email: account.email,
            pseudo: account.pseudo,
            password: hashedPassword,
            avatarPictureId: ids,
            accountStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                meanDifferencesFoundPerGame: 0,
                timeMeanPerGame: 0,
            } as UserStats,
            accountLevel: 0,
            accountRank: 0,
            currency: 0,
            language: account.language,
            theme: account.theme,
        };
        await this.databaseService.createAccount(accountDoc);
    }

    async isPseudoAvailable(pseudoName: string): Promise<boolean> {
        return (await this.databaseService.findPseudo({ pseudo: pseudoName })) === null;
    }

    async isValidRegexEmail(email: string): Promise<boolean> {
        return this.validateEmailRegex(email);
    }

    async isEmailValid(email: string): Promise<boolean> {
        const isValidRegex = this.validateEmailRegex(email);
        return isValidRegex ? this.isEmailAvailable(email) : false;
    }

    async isEmailAvailable(email: string): Promise<boolean> {
        return (await this.databaseService.findEmail({ email })) === null;
    }

    async getAccountIdByEmail(email: string): Promise<string> {
        const account: Account = await this.databaseService.findAccount({ email });
        return account ? account.accountId : '';
    }

    async getAccountIdByPseudo(pseudo: string): Promise<string> {
        const account: Account = await this.databaseService.findAccount({ pseudo });
        return account ? account.accountId : '';
    }

    async getAccountPseudoByEmail(email: string): Promise<string> {
        const account: Account = await this.databaseService.findAccount({ email });
        return account ? account.pseudo : '';
    }

    async getAccountEmailByPseudo(pseudo: string): Promise<string> {
        const account: Account = await this.databaseService.findAccount({ pseudo });
        return account ? account.email : '';
    }

    async getRankByPseudo(pseudo: string): Promise<number> {
        const account: Account = await this.databaseService.findAccount({ pseudo });
        return account ? account.accountRank : -1;
    }

    async getHashedPasswordByEmail(email: string): Promise<string> {
        const account: Account = await this.databaseService.findAccount({ email });
        return account ? account.password : '';
    }

    async getAccountId(pseudo: string): Promise<string> {
        const accountId: string = await this.databaseService.findAccountId({ pseudo });
        return accountId;
    }

    async isPseudoTaken(pseudo: string): Promise<boolean> {
        return await this.databaseService.findIsPseudoTaken({ pseudo });
    }

    // eslint-disable-next-line no-unused-vars
    saveAccountAvatar(image: AvatarImage): string {
        // TODO : Save image in database
        return this.generateAccountId();
    }

    async savePseudo(oldPseudoName: string, newPseudoName: string) {
        const isPseudoTaken = await this.isPseudoTaken(newPseudoName);
        if (!isPseudoTaken) {
            const accountDatabaseData = await this.databaseService.findAccount({ pseudo: oldPseudoName });
            accountDatabaseData.pseudo = newPseudoName;
            await this.databaseService.updatePseudo({ pseudo: oldPseudoName }, accountDatabaseData);
            const accountFriendsList = await this.databaseService.getAllFriends({});
            accountFriendsList.forEach( async ( friendList) => {
                    const listsToUpdate = [
                        friendList.friendList,
                        friendList.requestSentList,
                        friendList.receivedRequestList,
                        friendList.blockedList,
                        friendList.blockedByList,
                    ];
        
                    listsToUpdate.forEach(list => {
                        const index = list.findIndex(friend => friend.pseudo === oldPseudoName);
                        if (index !== -1) {
                            list[index].pseudo = newPseudoName;
                        }
                    });
        
                    await this.databaseService.updateFriends({accountId: friendList.accountId}, friendList);
                }
            );

            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);;
        }
    }

    async saveLanguage(userId: string, language: Language): Promise<void> {
        const accountDatabaseData: Account = await this.databaseService.findAccount({ accountId: userId });
        accountDatabaseData.language = language;
        await this.databaseService.updatePreference({ accountId: userId }, accountDatabaseData);
    }

    async saveTheme(userId: string, theme: Theme): Promise<void> {
        const accountDatabaseData: Account = await this.databaseService.findAccount({ accountId: userId });
        accountDatabaseData.theme = theme;
        await this.databaseService.updatePreference({ accountId: userId }, accountDatabaseData);
    }

    async getAccountData(pseudoName: string): Promise<AccountData> {
        // TODO : undefined for imageData
        const accountDatabaseData = await this.databaseService.findAccount({ pseudo: pseudoName });
        if (accountDatabaseData) {
            const accountData = {
                email: accountDatabaseData.email,
                accountId: accountDatabaseData.accountId,
                pseudo: accountDatabaseData.pseudo,
                password: accountDatabaseData.password,
                avatarPicture: { imageId: accountDatabaseData.avatarPictureId, imageData: undefined } as AvatarImage,
                accountStats: accountDatabaseData.accountStats,
                accountHistory: await this.databaseService.getHistory({ accountId: accountDatabaseData.accountId }),
                accountLevel: accountDatabaseData.accountLevel,
                accountRank: accountDatabaseData.accountRank,
                currency: accountDatabaseData.currency,
                language: accountDatabaseData.language,
                theme: accountDatabaseData.theme,
            } as AccountData;
            return accountData;
        }
        return {} as AccountData;
    }

    generateAccountId(): string {
        // Source : https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
        return Date.now().toString(RANDOM_PARAM) + Math.random().toString(RANDOM_PARAM).substring(2);
    }

    async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    async sendResetPasswordEmail(email: string, generatedCode: string) {
        if (await this.isValidRegexEmail(email)) {
            await this.emailService.sendPasswordResetEmail(email, generatedCode);
        }
    }

    private getAccountRank(accountLevel: number) {
        return accountLevel;
    }

    private validateEmailRegex(email: string): boolean {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    async createAccountConnection(accountId: string, connectionType: ConnectionType) {
        const timestamp = new Date();
        const connection:PlayerConnection = {
            accountId,
            date: timestamp.toLocaleDateString(LANGUAGE, TIMEZONE),
            time: timestamp.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'America/Montreal' }),
            connectionType,
        };
        await this.playerConnectionService.createPlayerConnection(connection);
    }
}
