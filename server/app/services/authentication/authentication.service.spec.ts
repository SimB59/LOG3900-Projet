/* eslint-disable */
import { Account, AccountDocument } from '@app/model/database/account';
import { AccountService } from '@app/services/account/account.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { EmailService } from '../mail/mail.service';
import { AuthenticationService } from './authentication.service';

jest.mock('@app/services/account/account.service');
jest.mock('../mail/mail.service');
jest.mock('@nestjs/jwt');

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let mockAccountService: AccountService;
    let mockEmailService: EmailService;
    let mockJwtService: JwtService;
    let mockAccountModel: Model<AccountDocument>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                AccountService,
                EmailService,
                JwtService,
                {
                    provide: getModelToken(Account.name),
                    useValue: Model
                },
            ],
        }).compile();

        service = module.get<AuthenticationService>(AuthenticationService);
        mockAccountService = module.get<AccountService>(AccountService);
        mockEmailService = module.get<EmailService>(EmailService);
        mockJwtService = module.get<JwtService>(JwtService);
        mockAccountModel = module.get<Model<AccountDocument>>(
            getModelToken(Account.name)
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /* describe('registerUserToken', () => {
        it('should register a user token if email and pseudo validation pass', async () => {
            jest.spyOn(mockAccountService, 'isEmailValid').mockResolvedValue(true);
            jest.spyOn(mockAccountService, 'isPseudoAvailable').mockResolvedValue(false);
            jest.spyOn(mockAccountService, 'getAccountIdByEmail').mockResolvedValue('userId');
            jest.spyOn(mockJwtService, 'sign').mockReturnValue('token');

            const accountData: AccountData = {
                email: 'user@example.com',
                pseudo: 'ok',
                password: 'account.password',
                avatarPicture: { imageId: 'd', imageData: {} } as AvatarImage,
                accountStats: {},
                accountHistory: [] as PlayerHistory[],
                accountLevel: 0,
                accountRankId: 0,
                currency: 0,
            } as AccountData;

            const result = await service.registerUserToken(accountData);

            expect(mockAccountService.isEmailValid).toHaveBeenCalledWith(accountData.email);
            expect(mockAccountService.isPseudoAvailable).toHaveBeenCalledWith(accountData.pseudo);
            expect(mockAccountService.getAccountIdByEmail).toHaveBeenCalledWith(accountData.email);
            expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: 'userId' });
            expect(result).toBe('token');
            expect(service['sessionsStore']['userId']).toEqual('token');
        });

    });

    describe('loginUser', () => {
        const email = 'user@example.com';
        const password = 'password123';
        const userId = 'someUserId';
        const token = 'someToken';
        
        beforeEach(() => {
            service['sessionsStore'] = new Map();
        });
        
        it('should return true when user is valid', async () => {
            jest.spyOn(mockAccountService, 'getHashedPasswordByEmail').mockResolvedValue('hashedPassword');
            jest.spyOn(service, 'validateUser').mockResolvedValue(true);
            jest.spyOn(mockAccountService, 'verifyPassword').mockResolvedValue(true);
            jest.spyOn(mockAccountService, 'getAccountIdByEmail').mockResolvedValue(userId);
            jest.spyOn(mockJwtService, 'sign').mockReturnValue(token);

            const result = await service.loginUser(email, password, "");

            expect(mockAccountService.getHashedPasswordByEmail).toHaveBeenCalledWith(email);
            expect(mockAccountService.verifyPassword).toHaveBeenCalledWith(password, 'hashedPassword');
            expect(mockAccountService.getAccountIdByEmail).toHaveBeenCalledWith(email);
            expect(mockJwtService.sign).toHaveBeenCalledWith({ userId });
            expect(result).toBe(true);
            expect(service['sessionsStore'][userId]).toEqual(token);
        });

        it('should return false when user or password is invalid', async () => {
            jest.spyOn(mockAccountService, 'getHashedPasswordByEmail').mockResolvedValue('hashedPassword');
            jest.spyOn(service, 'validateUser').mockResolvedValue(false);
            jest.spyOn(mockAccountService, 'verifyPassword').mockResolvedValue(true);

            const result = await service.loginUser(email, password, "");

            expect(result).toBe(false);
            expect(service['sessionsStore']).toEqual(new Map());
        });

    });

    describe('validateUser', () => {
        const email = 'user@example.com';
        const accountId = 'someAccountId';
    
        beforeEach(() => {
            service['sessionsStore'] = new Map();
        });
    
        it('should return false if no account ID is found', async () => {
            jest.spyOn(mockAccountService, 'getAccountIdByEmail').mockResolvedValue(null);
    
            const result = await service.validateUser(email);
    
            expect(mockAccountService.getAccountIdByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(false);
        });
    
        it('should return false if the user is already connected', async () => {
            jest.spyOn(mockAccountService, 'getAccountIdByEmail').mockResolvedValue(accountId);
            service['sessionsStore'][accountId] = 'existingToken';
    
            const result = await service.validateUser(email);
    
            expect(mockAccountService.getAccountIdByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(false);
        });

    }); */
});