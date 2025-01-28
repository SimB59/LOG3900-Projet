/* eslint-disable */
import { Account, AccountDocument } from "@app/model/database/account";
import { PlayerHistory } from "@app/model/database/player-history";
import { AccountData } from "@app/model/interfaces/account-data";
import { AvatarImage } from "@app/model/interfaces/avatar-image";
import { Language } from "@app/model/interfaces/language";
import { Test } from "@nestjs/testing";
import * as bcrypt from 'bcrypt';
import { SinonStubbedInstance, createStubInstance } from "sinon";
import { DatabaseService } from "../database/database.service";
import { FileService } from "../file/file.service";
import { EmailService } from "../mail/mail.service";
import { PlayerConnectionService } from "../player-connection/player-connection.service";
import { AccountService } from "./account.service";

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
  }));

describe('AccountService', () => {
    let service: AccountService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;
    let fileServiceStub: SinonStubbedInstance<FileService>;
    let playerConnectionServiceStub: SinonStubbedInstance<PlayerConnectionService>;
    let emailServiceStub: SinonStubbedInstance<EmailService>;
    
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [],
        }).compile();
        databaseServiceStub = createStubInstance(DatabaseService);
        fileServiceStub = createStubInstance(FileService);
        playerConnectionServiceStub = createStubInstance(PlayerConnectionService);
        emailServiceStub = createStubInstance(EmailService);
        service = new AccountService(databaseServiceStub, fileServiceStub, playerConnectionServiceStub, emailServiceStub);
    });

    beforeEach(() => {
        (bcrypt.hash as jest.Mock).mockReset();
      });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createAccount should save image and call createAccount', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('account.password');
        const id = "1"
        const accountDoc = {
            accountId: "1",
            email: 'd',
            pseudo: 'ok',
            password: 'account.password',
            avatarPictureId: '1',
            accountStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                meanDifferencesFoundPerGame: 0,
                timeMeanPerGame: 0,
            },
            accountRank: 0,
            accountLevel: 0,
            currency: 0,
            language: Language.EN,
        };
        let returnData: AccountData = {
            email: 'd',
            pseudo: 'ok',
            password: 'account.password',
            avatarPicture: {imageId: 'd', imageData: {}} as AvatarImage,
            accountStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                meanDifferencesFoundPerGame: 0,
                timeMeanPerGame: 0,
            },
            accountHistory: [] as PlayerHistory[],
            accountLevel: 0,
            accountRank: 0,
            currency: 0,
            language: Language.EN,
        } as AccountData;
        const generateAccountIdSpy = jest.spyOn<any, 'generateAccountId'>(service, 'generateAccountId').mockImplementation(()=>{return 1});
        const createAccountSpy = jest.spyOn(databaseServiceStub, 'createAccount').mockImplementation(async (account: Account) => {return account;});
        await service.createAccount(returnData, id);
        expect(databaseServiceStub.createAccount).toHaveBeenCalledWith(accountDoc);
        generateAccountIdSpy.mockRestore();
        createAccountSpy.mockRestore();
    });
    
    // saveAccountAvatar
    it('saveAccountAvatar should write avatar in file only if is not a base image', async () => {
        let image = {imageId: 'id', imageData: {}} as AvatarImage;
        const fileServiceGetImageLocationSpy = jest.spyOn(fileServiceStub, 'getImageLocation');
        fileServiceGetImageLocationSpy.mockImplementation((hey: string, ok: string) => {return "path"});
        const fileServiceWriteSpy = jest.spyOn(fileServiceStub, 'write');
        fileServiceWriteSpy.mockImplementation((hey: string, ok: string) => {});
        fileServiceWriteSpy.mockClear();
        service.saveAccountAvatar(image);
        expect(fileServiceWriteSpy).not.toHaveBeenCalledWith('path', image.imageData);
    });

    it('saveAccountAvatar should not write avatar in file if is a base image', async () => {
        let image = {imageId: 'base_01', imageData: {}} as AvatarImage;
        const fileServiceWriteSpy1 = jest.spyOn(fileServiceStub, 'write');
        fileServiceWriteSpy1.mockImplementation((hey: string, ok: string) => {});
        fileServiceWriteSpy1.mockClear();
        service.saveAccountAvatar(image);
        expect(fileServiceStub.write).not.toHaveBeenCalled();
    });


    // findPseudo
    it('findPseudo should return true when pseudo not in database', async () => {
        const findPseudoSpy = jest.spyOn(databaseServiceStub, 'findPseudo');
        findPseudoSpy.mockResolvedValue(null);
        const returnValue = await service.isPseudoAvailable("pseudo");
        expect(returnValue).toBe(true);
    });

    it('findPseudo should return false when pseudo in database', async () => {
        const findPseudoSpy = jest.spyOn(databaseServiceStub, 'findPseudo');
        findPseudoSpy.mockResolvedValue({email: "a"} as AccountDocument);
        const returnValue = await service.isPseudoAvailable("pseudo");
        expect(returnValue).toBe(false);
    });
    

    // getAccountData
    //TODO: redo after refactor in account.service.ts
    // it('getAccountData should return account data without password if account is found', async () => {
    //     let accountData: Account = {accountId: "1", email: "d", pseudo: "ok", password: "d", avatarPictureId: 'd', accountStats: {} as UserStats, accountLevel: 1, currency: 1};
    //     let returnData: AccountData = {
    //         email: 'd',
    //         pseudo: 'ok',
    //         password: '',
    //         avatarPicture: {imageId: 'd', imageData: {}} as AvatarImage,
    //         accountStats: {},
    //         accountHistory: [] as PlayerHistory[],
    //         accountLevel: 1,
    //         accountRankId: 1,
    //         currency: 1,
    //     } as AccountData;
    //     let databaseServicefindAccountSpy: jest.SpyInstance;
    //     let getRankSpy: jest.SpyInstance;
    //     databaseServicefindAccountSpy = jest.spyOn(databaseServiceStub, 'findAccount').mockImplementation(async () => {
    //         return accountData;
    //     });
    //     let databaseServiceFindHistory: jest.SpyInstance = jest.spyOn(databaseServiceStub, 'getHistory').mockImplementation(async () => {
    //         return [];
    //     });
    //     getRankSpy = jest.spyOn<any, 'getAccountRank'>(service, 'getAccountRank').mockImplementation(()=> {
    //         return 1;
    //     })
    //     const returnValue = await service.getAccountData("ok");
    //     expect(returnValue).toEqual(returnData);
    // });

    it('getAccountData should return empty if account is not found', async () => {
        let databaseServicefindAccountSpy: jest.SpyInstance;
        databaseServicefindAccountSpy = jest.spyOn(databaseServiceStub, 'findAccount').mockImplementation(async () => {
            return null;
        });
        const returnValue = await service.getAccountData("d");
        expect(returnValue).toEqual({});
    });


    // savePseudo
    // it('savePseudo should save new pseudo to database', async () => {
    //     let accountData: Account = {accountId: "1", email: "d", pseudo: "ok", password: "d", avatarPictureId: 'd', accountStats: {} as UserStats, accountLevel: 1, accountRank: 0, currency: 1, language: Language.FR, theme: DEFAULT_THEME};
    //     let databaseServicefindAccountSpy: jest.SpyInstance;
    //     let databaseServiceUpdatePseudoSpy: jest.SpyInstance;
    //     let findPseudoSpy: jest.SpyInstance;
    //     databaseServicefindAccountSpy = jest.spyOn(databaseServiceStub, 'findAccount').mockImplementation(async () => {
    //         return accountData;
    //     });
    //     databaseServiceUpdatePseudoSpy = jest.spyOn(databaseServiceStub, 'updatePseudo');
    //     findPseudoSpy = jest.spyOn(service, 'isPseudoAvailable').mockImplementation(async () => {
    //         return true;
    //     });
    //     await service.savePseudo("ok", "new");
    //     let newAccountData = {accountId: "1", email: "d", pseudo: "new", password: "d", avatarPictureId: 'd', accountStats: {} as UserStats, accountLevel: 1, currency: 1, language: Language.FR, theme: DEFAULT_THEME};
    //     expect(databaseServicefindAccountSpy).toHaveBeenCalledWith({pseudo: "ok"});
    //     expect(databaseServiceUpdatePseudoSpy).toHaveBeenCalledWith({pseudo: "ok"}, newAccountData);
    // });

    // it('savePseudo should throw error if pseudo is not unique', async () => {
    //     let accountData: Account = {accountId: "1", email: "d", pseudo: "ok", password: "d", avatarPictureId: 'd', accountStats: {} as UserStats, accountLevel: 1, currency: 1, language: Language.EN, theme: DEFAULT_THEME};
    //     let databaseServicefindAccountSpy: jest.SpyInstance;
    //     let databaseServiceUpdatePseudoSpy: jest.SpyInstance;
    //     let findPseudoSpy: jest.SpyInstance;
    //     databaseServicefindAccountSpy = jest.spyOn(databaseServiceStub, 'findAccount').mockImplementation(async () => {
    //         return accountData;
    //     });
    //     databaseServiceUpdatePseudoSpy = jest.spyOn(databaseServiceStub, 'updatePseudo');
    //     findPseudoSpy = jest.spyOn(service, 'isPseudoAvailable').mockImplementation(async () => {
    //         return false;
    //     });
    //     const savePseudoFunction = async () => {
    //         await service.savePseudo("ok", "new");
    //       };
    //     await expect(savePseudoFunction()).rejects.toThrowError("Pseudo is not unique");

    // }); 

    // generateAccountId
    it('generateAccountId should generate unique ids', async () => {
        const idSet = new Set<string>();
        for (let i = 0; i < 1000; i++) {
          const generatedId = service["generateAccountId"]();
          idSet.add(generatedId);
        }
        expect(idSet.size).toBe(1000);
    });
});
