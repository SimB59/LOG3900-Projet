/* eslint-disable */
import { Account, AccountDocument } from '@app/model/database/account';
import { ConnectionType } from '@app/model/database/player-connection';
import { AccountData } from '@app/model/interfaces/account-data';
import { AccountService } from '@app/services/account/account.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthenticationService {
    sessionsStore: Map<string, string>;
    socketStore: Map<string, string>;
    private tokenStore: Map<string, string>;

    constructor(
        @InjectModel(Account.name) public accountModel: Model<AccountDocument>,
        private readonly accountService: AccountService,
        private jwtService: JwtService,
    ) {
        this.sessionsStore = new Map<string, string>();
        this.tokenStore = new Map<string, string>();
        this.socketStore = new Map<string, string>();
    }

    getSessionsStoreTokenByUserId(userId: string): string {
        return this.sessionsStore.get(userId);
    }

    async registerUserToken(accountData: AccountData): Promise<string> {
        const isEmailValid = await this.accountService.isEmailValid(accountData.email);
        const isFoundPseudo = await this.accountService.isPseudoAvailable(accountData.pseudo);
        if (isEmailValid && !isFoundPseudo) {
            const userId = await this.accountService.getAccountIdByEmail(accountData.email);
            const token = this.jwtService.sign({ userId });
            this.sessionsStore.set(userId, token);
            return token;
        } else {
            return '';
        }
    }

    async loginUser(email: string, password: string, socketId: string): Promise<boolean> {
        const hashedPassword = await this.accountService.getHashedPasswordByEmail(email);
        const isValidUser = await this.validateUser(email);
        const isValidPassword = await this.accountService.verifyPassword(password, hashedPassword);
        if (isValidUser && isValidPassword) {
            const accountId = await this.accountService.getAccountIdByEmail(email);
            const token = this.jwtService.sign({ accountId });
            this.sessionsStore.set(accountId, token);
            this.socketStore.set(socketId, accountId);
            await this.accountService.createAccountConnection(accountId, ConnectionType.LOGIN);
            return true;
        } else {
            return false;
        }
    }

    async validateUser(email: string): Promise<boolean> {
        const accountId = await this.accountService.getAccountIdByEmail(email);
        const isAlreadyConnected = this.isAlreadyConnected(accountId);
        if (accountId && !isAlreadyConnected) {
            return true;
        } else {
            return false;
        }
    }

    async resetPassword(email: string, password: string) {
        const hashedPassword = await this.accountService.hashPassword(password);
        await this.accountService.updatePassword(email, hashedPassword);
    }

    getSocketByAccountId(accountId: string): string {
        // console.log('accountId Prime: ' + accountId);
        for (const [key, value] of this.socketStore.entries()) {
            // console.log('accountId: ' + value);
            // console.log('socketId: ' + key);
            if (value === accountId) return key;
        }
        return '';
    }

    isAlreadyConnected(userId: string): boolean {
        return this.sessionsStore.get(userId) !== undefined;
    }

    async logoutUser(userId: string): Promise<void> {
        this.sessionsStore.delete(userId);
        try {
            await this.accountService.createAccountConnection(userId, ConnectionType.LOGOUT);
        } catch (error) {
            console.error("catched");
        }
    }

    async logoutUserBySocket(socketId: string): Promise<void> {
        const userId = this.socketStore.get(socketId);
        this.socketStore.delete(socketId);
        try {
            if (userId) {
                await this.logoutUser(userId);
            }
        } catch (error) {
            // eslint-disable-next-line
            console.log(error);
        }
    }

    logoutAll(): void {
        this.sessionsStore.clear();
        this.socketStore.clear();
    }
}
