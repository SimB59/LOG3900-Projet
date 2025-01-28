/* eslint-disable @typescript-eslint/no-explicit-any */

import { PlayerHistory } from '@app/model/database/player-history';
import { AccountData } from '@app/model/interfaces/account-data';
import { AvatarImage } from '@app/model/interfaces/avatar-image';
import { AccountService } from '@app/services/account/account.service';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as fs from 'fs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Readable } from 'stream';
import { AccountController } from './account.controller';

/* eslint-disable */

const mockAuthenticationService = {
    registerUserToken: jest.fn(),
    loginUser: jest.fn(),
    validateUser: jest.fn(),
    resetPassword: jest.fn(),
    isAlreadyConnected: jest.fn(),
    logoutUser: jest.fn(),
  };

const mockFile: Express.Multer.File = {
    fieldname: 'avatarPicture',
    originalname: 'avatar.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test buffer'),
    size: 1234,
    destination: './avatars',
    filename: 'avatar1234.jpg',
    path: './avatars/avatar1234.jpg',
    stream: new Readable(),
} as Express.Multer.File;

const originalFs = jest.requireActual('fs');
jest.mock('fs', () => {
    const actualFs = jest.requireActual('fs');
    return {
      ...actualFs,
      rename: jest.fn((oldPath, newPath, callback) => callback(null)),
    };
  });

describe('AccountController', () => {
    let accountController: AccountController;
    let accountService: SinonStubbedInstance<AccountService>;
    let res: Response;

    beforeEach(() => {
        (fs.rename as unknown as jest.Mock).mockReset();
    });
    
    beforeEach(async () => {
        accountService = createStubInstance(AccountService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountController],
            providers: [
                {
                    provide: AccountService,
                    useValue: accountService,
                },
                {
                    provide: AuthenticationService,
                    useValue: mockAuthenticationService,
                },
            ],
        }).compile();

        accountController = module.get<AccountController>(AccountController);
        res = {} as unknown as Response;
        res.cookie = jest.fn().mockReturnValue(res);
    });

    it('should be defined', () => {
        expect(accountController).toBeDefined();
    });

    // POST createAccount
    it('createAccount should return BAD REQUEST, Invalid email if email address is not valid', async () => {
        const accountData: AccountData = {
            email: 'd',
            pseudo: 'ok',
            password: 'account.password',
            avatarPicture: { imageId: 'd', imageData: {} } as AvatarImage,
            accountStats: {},
            accountHistory: [] as PlayerHistory[],
            accountLevel: 0,
            accountRank: 0,
            currency: 0,
        } as AccountData;
        const messageSent = { title: '', body: JSON.stringify(accountData) };
        const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Invalid email' };
        jest.spyOn(accountService, 'isEmailValid').mockImplementation(async () => {
            return false;
        });
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual(expectedReturnMessage);
            return res;
        };
        await accountController.createAccount(messageSent, mockFile, res);
    });

    it('createAccount should return BAD REQUEST, Pseudo is not valid if pseudo is not valid', async () => {
        const accountData: AccountData = {
            email: 'd',
            pseudo: 'ok',
            password: 'account.password',
            avatarPicture: { imageId: 'd', imageData: {} } as AvatarImage,
            accountStats: {},
            accountHistory: [] as PlayerHistory[],
            accountLevel: 0,
            accountRank: 0,
            currency: 0,
        } as AccountData;
        const messageSent = { title: '', body: JSON.stringify(accountData) };
        const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Invalid pseudo' };
        jest.spyOn(accountService, 'isEmailValid').mockImplementation(async () => {
            return true;
        });
        jest.spyOn(accountService, 'isPseudoAvailable').mockImplementation(async () => {
            return false;
        });

        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual(expectedReturnMessage);
            return res;
        };
        await accountController.createAccount(messageSent, mockFile, res);
    });

    it('createAccount should return OK if account creation is successful', async () => {
        const accountData: AccountData = {
            email: 'a@b.com',
            pseudo: 'examplePseudoTest',
            password: 'account.password',
            avatarPicture: { imageId: 'd', imageData: {} } as AvatarImage,
            accountStats: {},
            accountHistory: [] as PlayerHistory[],
            accountLevel: 0,
            accountRank: 0,
            currency: 0,
        } as AccountData;
        const messageSent = { title: '', body: JSON.stringify(accountData) };
        const expectedReturnMessage = { title: 'OK', body: 'userId123' };

        jest.spyOn(accountService, 'generateAccountId').mockReturnValue('userId123');
        
        jest.spyOn(accountService, 'isEmailValid').mockImplementation(async () => {
            return true;
        });
        jest.spyOn(accountService, 'isPseudoAvailable').mockImplementation(async () => {
            return true;
        });
        jest.spyOn(mockAuthenticationService, 'registerUserToken').mockResolvedValue('token');


        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual(expectedReturnMessage);
            return res;
        };
        await accountController.createAccount(messageSent, mockFile, res);
    });

    // GET getAccount
    it('getAccount should return account data', async () => {
        const accountData: AccountData = {
            email: 'd',
            pseudo: 'ok',
            password: 'account.password',
            avatarPicture: { imageId: 'd', imageData: {} } as AvatarImage,
            accountStats: {},
            accountHistory: [] as PlayerHistory[],
            accountLevel: 0,
            accountRank: 0,
            currency: 0,
        } as AccountData;
        const accountString = JSON.stringify(accountData);
        const messageSent = { title: '', body: JSON.stringify(accountData) };
        const expectedReturnMessage = { title: 'OK', body: accountString };
        jest.spyOn(accountService, 'getAccountData').mockImplementation(async () => {
            return accountData;
        });
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual(expectedReturnMessage);
            return res;
        };
        await accountController.getAccount('ok', res);
    });

    // // POST saveAvatar
    // it('saveAvatar should save avatar', async () => {
    //     const avatar: AvatarImage = {
    //         imageId: 'string',
    //         imageData: {},
    //     } as AvatarImage;
    //     const messageSent = { title: '', body: JSON.stringify(avatar) };
    //     const expectedReturnMessage = { title: 'OK', body: 'Avatar saved correctly' };
    //     jest.spyOn(accountService, 'saveAccountAvatar').mockImplementation(() => {return "123456";});
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.OK);
    //         return res;
    //     };
    //     res.send = (message) => {
    //         expect(message).toEqual(expectedReturnMessage);
    //         return res;
    //     };
    //     await accountController.saveAvatar(messageSent, res);
    // });

    // POST savePseudo
    // it('savePseudo should save pseudo', async () => {
    //     const pseudo: PseudoModification = {
    //         oldPseudo: 'string',
    //         newPseudo: 'd',
    //     } as PseudoModification;
    //     const messageSent = { title: '', body: JSON.stringify(pseudo) };
    //     const expectedReturnMessage = { title: 'OK', body: 'Pseudo saved correctly' };
    //     jest.spyOn(accountService, 'savePseudo').mockImplementation(async () => {});
    //     res.status = (code) => {
    //         expect(code).toEqual(HttpStatus.OK);
    //         return res;
    //     };
    //     res.send = (message) => {
    //         expect(message).toEqual(expectedReturnMessage);
    //         return res;
    //     };
    //     await accountController.savePseudo(messageSent, res);
    // });
});
