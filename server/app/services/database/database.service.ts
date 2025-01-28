import { Account, AccountDocument } from '@app/model/database/account';
import { AccountFriends, AccountFriendsDocument } from '@app/model/database/account-friends';
import { GameHistory, GameHistoryDocument } from '@app/model/database/game-history';
import { PlayerConnection, PlayerConnectionDocument } from '@app/model/database/player-connection';
import { PlayerHistory } from '@app/model/database/player-history';
import { PlayerStats, StatDocument } from '@app/model/database/player-stats';
import { VideoReplay, VideoReplayDocument } from '@app/model/database/video-replay';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class DatabaseService {
    // eslint-disable-next-line max-params
    constructor(
        @InjectModel(PlayerStats.name) public statModel: Model<StatDocument>,
        @InjectModel(GameHistory.name) public gameHistoryModel: Model<GameHistoryDocument>,
        @InjectModel(Account.name) public accountModel: Model<AccountDocument>,
        @InjectModel(AccountFriends.name) public friendModel: Model<AccountFriendsDocument>,
        @InjectModel(PlayerConnection.name) public playerConnectionModel: Model<PlayerConnectionDocument>,
        @InjectModel(VideoReplay.name) public videoReplayModel: Model<VideoReplayDocument>,
    ) {}

    async findStats(filter: FilterQuery<PlayerStats>): Promise<PlayerStats[]> {
        try {
            return this.statModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async findAccountId(filter: FilterQuery<Account>): Promise<string> {
        try {
            const account: Pick<AccountDocument, 'accountId'> = await this.accountModel.findOne(filter, 'accountId -_id').exec();
            return account ? account.accountId : '';
        } catch (error) {
            // console.error(error);
            return;
        }
    }

    // async findEmail(filter: FilterQuery<Account>): Promise<string> {
    //     try {
    //         const account: Pick<AccountDocument, 'accountId'> = await this.accountModel.findOne(filter, 'accountId -_id').exec();
    //         return account ? account.accountId : '';
    //     } catch (error) {
    //         console.error(error);
    //         return;
    //     }
    // }

    async findAccount(filter: FilterQuery<Account>): Promise<Account> {
        try {
            return this.accountModel.findOne(filter);
        } catch (error) {
            return;
        }
    }

    async findAccounts(filter: FilterQuery<Account>): Promise<Account[]> {
        try {
            return this.accountModel.find(filter);
        } catch (error) {
            return;
        }
    }

    async findEmail(filter: FilterQuery<Account>): Promise<Account> {
        try {
            return this.accountModel.findOne(filter);
        } catch (error) {
            return;
        }
    }

    async findGameHistory(filter: FilterQuery<GameHistory>): Promise<GameHistory[]> {
        try {
            return this.gameHistoryModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async createStats(stat: PlayerStats): Promise<PlayerStats> {
        try {
            return this.statModel.create(stat);
        } catch (error) {
            return {} as PlayerStats;
        }
    }

    async createAccount(account: Account): Promise<Account> {
        try {
            this.friendModel.create({
                accountId: account.accountId,
                friendList: [],
                requestSentList: [],
                receivedRequestList: [],
                blockedList: [],
            } as AccountFriends);
            return this.accountModel.create(account);
        } catch (error) {
            return {} as Account;
        }
    }

    async createHistory(history: GameHistory): Promise<GameHistory> {
        try {
            return this.gameHistoryModel.create(history);
        } catch (error) {
            return {} as GameHistory;
        }
    }

    async createVideoReplay(replay: VideoReplay): Promise<VideoReplay> {
        try {
            return this.videoReplayModel.create(replay);
        } catch (error) {
            return {} as VideoReplay;
        }
    }

    async findVideoReplay(filter: FilterQuery<VideoReplay>): Promise<VideoReplay> {
        try {
            return this.videoReplayModel.findOne(filter);
        } catch (error) {
            return {} as VideoReplay;
        }
    }

    async findVideoReplays(filter: FilterQuery<VideoReplay>): Promise<VideoReplay[]> {
        try {
            return this.videoReplayModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async deleteVideoReplay(filter: FilterQuery<VideoReplay>): Promise<unknown> {
        try {
            return this.videoReplayModel.deleteOne(filter);
        } catch (error) {
            return [];
        }
    }

    async updateVideoReplay(filter: FilterQuery<VideoReplay>, videoReplayData: VideoReplay): Promise<unknown> {
        try {
            return this.videoReplayModel.updateOne(filter, videoReplayData);
        } catch (error) {
            return [];
        }
    }

    async getVideoReplays(accountId: string): Promise<VideoReplay[]> {
        try {
            return await this.videoReplayModel.find({ $or: [{ isPublic: true }, { accountId }] });
        } catch (error) {
            return [];
        }
    }

    async remove(filter: FilterQuery<PlayerStats>): Promise<unknown> {
        try {
            return this.statModel.deleteMany(filter);
        } catch (error) {
            return;
        }
    }

    async removeHistory(filter: FilterQuery<GameHistory>): Promise<unknown> {
        try {
            return this.gameHistoryModel.deleteMany(filter);
        } catch (error) {
            return;
        }
    }

    async findPseudo(filter: FilterQuery<Account>): Promise<AccountDocument> {
        try {
            return this.accountModel.findOne(filter);
        } catch (error) {
            return;
        }
    }
    async findIsPseudoTaken(filter: FilterQuery<Account>): Promise<boolean> {
        // eslint-disable-next-line no-useless-catch
        try {
            const account = await this.accountModel.findOne(filter, 'pseudo -_id').exec();
            return account == null ? false : true;
        } catch (error) {
            throw error; // Or handle it in a way that's appropriate for your application
        }
    }

    async updatePseudo(filter: FilterQuery<Account>, accountData: Account): Promise<unknown> {
        try {
            return this.accountModel.updateOne(filter, accountData);
        } catch (error) {
            return [];
        }
    }

    async updatePreference(filter: FilterQuery<Account>, accountData: Account): Promise<unknown> {
        try {
            return this.accountModel.updateOne(filter, accountData);
        } catch (error) {
            return [];
        }
    }

    async updatePassword(email: string, password: string) {
        try {
            const filter = { email };
            const update = {
                $set: {
                    password,
                },
            };
            return this.accountModel.updateOne(filter, update);
        } catch (error) {
            return [];
        }
    }

    // async updatePassword(filter: FilterQuery<Account>, accountData: Account): Promise<unknown> {
    //     try {
    //         return this.accountModel.updateOne(filter, accountData);
    //     } catch (error) {
    //         return [];
    //     }
    // }

    async getHistory(filter: FilterQuery<Account>): Promise<PlayerHistory[]> {
        try {
            return this.accountModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async getFriends(filter: FilterQuery<AccountFriends>): Promise<AccountFriends> {
        try {
            return await this.friendModel.findOne(filter);
        } catch (error) {
            return {} as AccountFriends;
        }
    }

    async getAllFriends(filter: FilterQuery<AccountFriends>): Promise<AccountFriends[]> {
        try {
            return await this.friendModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async updateFriends(filter: FilterQuery<AccountFriends>, friendData: AccountFriends): Promise<unknown> {
        try {
            return await this.friendModel.updateOne(filter, friendData);
        } catch (error) {
            return [];
        }
    }

    async createPlayerConnection(playerConnection: PlayerConnection): Promise<PlayerConnection> {
        try {
            return this.playerConnectionModel.create(playerConnection);
        } catch (error) {
            return {} as PlayerConnection;
        }
    }

    async removePlayerConnection(filter: FilterQuery<PlayerConnection>): Promise<unknown> {
        try {
            return this.playerConnectionModel.deleteMany(filter);
        } catch (error) {
            return;
        }
    }

    async findPlayerConnection(filter: FilterQuery<PlayerConnection>): Promise<PlayerConnection[]> {
        try {
            return this.playerConnectionModel.find(filter);
        } catch (error) {
            return [];
        }
    }
}
