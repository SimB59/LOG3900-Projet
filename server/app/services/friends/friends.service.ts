import { AccountFriends } from '@app/model/database/account-friends';
import { GameHistory } from '@app/model/database/game-history';
import { PlayerConnection } from '@app/model/database/player-connection';
import { DatabaseService } from '@app/services/database/database.service';
import { Friend } from '@common/friend';
import { Injectable } from '@nestjs/common';

const NOT_FOUND_INDEX = -1;

@Injectable()
export class FriendService {
    constructor(private databaseService: DatabaseService) {}

    isFriendInList = (friendFromList: Friend, friendToCheck: Friend) => {
        return friendFromList.accountId === friendToCheck.accountId && friendFromList.pseudo === friendToCheck.pseudo;
    };

    async getFriendData(playerId: string): Promise<AccountFriends> {
        return await this.databaseService.getFriends({ accountId: playerId });
    }

    async sentFriendRequest(player: Friend, friend: Friend): Promise<AccountFriends[]> {
        const oldFriendData1 = await this.getFriendData(player.accountId);
        oldFriendData1.requestSentList.push(friend);
        this.databaseService.updateFriends({ accountId: player.accountId }, oldFriendData1);
        const oldFriendData2 = await this.getFriendData(friend.accountId);
        oldFriendData2.receivedRequestList.push({ accountId: player.accountId, pseudo: player.pseudo });
        this.databaseService.updateFriends({ accountId: friend.accountId }, oldFriendData2);
        return [oldFriendData1, oldFriendData2];
    }

    async removeFriend(player: Friend, friend: Friend): Promise<AccountFriends[]> {
        const oldFriendData1 = await this.getFriendData(player.accountId);
        const oldFriendData2 = await this.getFriendData(friend.accountId);
        if (oldFriendData1.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)) !== NOT_FOUND_INDEX) {
            oldFriendData1.friendList.splice(
                oldFriendData1.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)),
                1,
            );
        }
        if (oldFriendData2.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)) !== NOT_FOUND_INDEX) {
            oldFriendData2.friendList.splice(
                oldFriendData2.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)),
                1,
            );
        }
        this.databaseService.updateFriends({ accountId: player.accountId }, oldFriendData1);
        this.databaseService.updateFriends({ accountId: friend.accountId }, oldFriendData2);
        return [oldFriendData1, oldFriendData2];
    }

    async sentBlockDemand(player: Friend, friend: Friend): Promise<AccountFriends[]> {
        const oldFriendData1 = await this.getFriendData(player.accountId);
        oldFriendData1.blockedList.push(friend);

        const oldFriendData2 = await this.getFriendData(friend.accountId);
        oldFriendData2.blockedByList.push({ accountId: player.accountId, pseudo: player.pseudo });

        if (oldFriendData1.receivedRequestList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)) !== NOT_FOUND_INDEX) {
            oldFriendData1.receivedRequestList.splice(
                oldFriendData1.receivedRequestList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)),
                1,
            );
        }
        if (oldFriendData2.receivedRequestList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)) !== NOT_FOUND_INDEX) {
            oldFriendData2.receivedRequestList.splice(
                oldFriendData2.receivedRequestList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)),
                1,
            );
        }
        if (oldFriendData1.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)) !== NOT_FOUND_INDEX) {
            oldFriendData1.friendList.splice(
                oldFriendData1.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)),
                1,
            );
        }
        if (oldFriendData2.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)) !== NOT_FOUND_INDEX) {
            oldFriendData2.friendList.splice(
                oldFriendData2.friendList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)),
                1,
            );
        }
        if (oldFriendData1.requestSentList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)) !== NOT_FOUND_INDEX) {
            oldFriendData1.requestSentList.splice(
                oldFriendData1.requestSentList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)),
                1,
            );
        }
        if (oldFriendData2.requestSentList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)) !== NOT_FOUND_INDEX) {
            oldFriendData2.requestSentList.splice(
                oldFriendData2.requestSentList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)),
                1,
            );
        }
        this.databaseService.updateFriends({ accountId: player.accountId }, oldFriendData1);
        this.databaseService.updateFriends({ accountId: friend.accountId }, oldFriendData2);
        return [oldFriendData1, oldFriendData2];
    }

    async sentUnBlockDemand(player: Friend, friend: Friend): Promise<AccountFriends[]> {
        const oldFriendData1 = await this.getFriendData(player.accountId);
        const oldFriendData2 = await this.getFriendData(friend.accountId);
        if (
            oldFriendData1.blockedList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)) !== NOT_FOUND_INDEX &&
            oldFriendData2.blockedByList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)) !== NOT_FOUND_INDEX
        ) {
            oldFriendData1.blockedList.splice(
                oldFriendData1.blockedList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)),
                1,
            );
            oldFriendData2.blockedByList.splice(
                oldFriendData2.blockedByList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)),
                1,
            );
        }

        this.databaseService.updateFriends({ accountId: player.accountId }, oldFriendData1);
        this.databaseService.updateFriends({ accountId: friend.accountId }, oldFriendData2);
        return [oldFriendData1, oldFriendData2];
    }

    async actOnFriendRequestReceived(player: Friend, friend: Friend, isAccepted: boolean): Promise<AccountFriends[]> {
        const oldFriendData1 = await this.getFriendData(player.accountId);
        const oldFriendData2 = await this.getFriendData(friend.accountId);
        if (
            oldFriendData1.receivedRequestList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)) !== NOT_FOUND_INDEX &&
            oldFriendData2.requestSentList.findIndex((friendFromList) => this.isFriendInList(friendFromList, player)) !== NOT_FOUND_INDEX
        ) {
            oldFriendData1.receivedRequestList.splice(
                oldFriendData1.receivedRequestList.findIndex((friendFromList) => this.isFriendInList(friendFromList, friend)),
                1,
            );
            oldFriendData2.requestSentList.splice(oldFriendData2.requestSentList.indexOf({ accountId: player.accountId, pseudo: player.pseudo }), 1);
        }
        if (isAccepted) {
            oldFriendData1.friendList.push(friend);
            oldFriendData2.friendList.push({ accountId: player.accountId, pseudo: player.pseudo });
        }
        this.databaseService.updateFriends({ accountId: player.accountId }, oldFriendData1);
        this.databaseService.updateFriends({ accountId: friend.accountId }, oldFriendData2);
        return [oldFriendData1, oldFriendData2];
    }

    /* async removeFriend(playerId: string, friend: Friend) {
        // TODO : Remove friend from database for both and notify friend
    }

    async searchPlayer(playerName: string) {
        // TODO : query database with player name matching entry
        // TODO : query friends of every found
    } */

    async searchPlayers(playerName: string, accountId: string) {
        const excludedFriends = await this.getFriendData(accountId);
        const excludedAccountIds = excludedFriends.blockedByList.map((friend: Friend) => friend.accountId);
        excludedAccountIds.push(accountId);
        const allSearchedData = await this.databaseService.findAccounts({
            pseudo: { $regex: `^${playerName}` },
            accountId: { $nin: excludedAccountIds },
        });
        return allSearchedData;
        // TODO : query database with player name matching entry
        // TODO : query friends of every found
    }

    async getAccountFriends(accountId: string, playerAccountId: string) {
        const playerAccountFriendsData = await this.getFriendData(playerAccountId);
        const friends = await this.getFriendData(accountId);
        const excludedFriends = playerAccountFriendsData.blockedByList.map((friend: Friend) => friend.accountId);
        excludedFriends.push(playerAccountId);
        const uniqueFriends = friends.friendList.filter((friend) => !excludedFriends.includes(friend.accountId));

        return uniqueFriends;
    }

    async getPlayerProfile(accountId: string) {
        const profileData = await this.databaseService.findAccount({
            accountId,
        });
        return profileData;
    }

    async getFriendsOfFriends(accountId: string) {
        const accountFriendsData = await this.getFriendData(accountId);
        if (!accountFriendsData) {
            throw new Error('Account friends not found.');
        }

        const allFriendAccountIds = accountFriendsData.friendList.map((friend) => friend.accountId);
        const friendsOfFriends = await this.databaseService.getAllFriends({ accountId: { $in: allFriendAccountIds } });

        const combinedFriends = [...accountFriendsData.friendList];
        friendsOfFriends.forEach((friends) => {
            combinedFriends.push(...friends.friendList);
        });

        const excludedFriends = accountFriendsData.blockedByList.map((friend: Friend) => friend.accountId);
        excludedFriends.push(accountId);
        const uniqueFriends = combinedFriends.filter((friend) => !excludedFriends.includes(friend.accountId));

        return uniqueFriends;
    }

    async getFriends(accountId: string, friendAccountId: string) {
        const friendAccountFriendsData = await this.getFriendData(friendAccountId);
        const accountFriendsData = await this.getFriendData(accountId);
        const excludedFriends = accountFriendsData.blockedByList.map((friend: Friend) => friend.accountId);
        excludedFriends.push(accountId);
        const uniqueFriends = friendAccountFriendsData.friendList.filter((friend) => !excludedFriends.includes(friend.accountId));

        return uniqueFriends;
    }

    async getAccountActivity(accountId: string): Promise<PlayerConnection[]> {
        const accountConnectionData = await this.databaseService.findPlayerConnection({ accountId });
        const sortedAccountConnections = this.sortPlayerByTimeAndDate(accountConnectionData);
        return sortedAccountConnections;
    }

    async getGameHistory(accountId: string): Promise<GameHistory[]> {
        const accountGameHistoryData = await this.databaseService.findGameHistory({ accountId });
        const sortedAccountGameHistory = this.sortHistoryByTimeAndDate(accountGameHistoryData);
        return sortedAccountGameHistory;
    }

    sortPlayerByTimeAndDate(connections: PlayerConnection[]): PlayerConnection[] {
        const comparePlayerConnections = (a: PlayerConnection, b: PlayerConnection): number => {
            const [yearA, monthA, dayA] = a.date.split('-').map(Number);
            const [yearB, monthB, dayB] = b.date.split('-').map(Number);

            if (yearA !== yearB) {
                return yearA - yearB;
            }
            if (monthA !== monthB) {
                return monthA - monthB;
            }
            if (dayA !== dayB) {
                return dayA - dayB;
            }

            const [hourA, minuteA, secondA] = a.time.split(':').map(Number);
            const [hourB, minuteB, secondB] = b.time.split(':').map(Number);

            if (hourA !== hourB) {
                return hourA - hourB;
            }
            if (minuteA !== minuteB) {
                return minuteA - minuteB;
            }
            if (secondA !== secondB) {
                return secondA - secondB;
            }

            return 0;
        };
        return connections.sort(comparePlayerConnections);
    }

    sortHistoryByTimeAndDate(connections: GameHistory[]): GameHistory[] {
        const comparePlayerConnections = (a: GameHistory, b: GameHistory): number => {
            const [yearA, monthA, dayA] = a.date.split('-').map(Number);
            const [yearB, monthB, dayB] = b.date.split('-').map(Number);

            if (yearA !== yearB) {
                return yearA - yearB;
            }
            if (monthA !== monthB) {
                return monthA - monthB;
            }
            if (dayA !== dayB) {
                return dayA - dayB;
            }

            const [hourA, minuteA, secondA] = a.time.split(':').map(Number);
            const [hourB, minuteB, secondB] = b.time.split(':').map(Number);

            if (hourA !== hourB) {
                return hourA - hourB;
            }
            if (minuteA !== minuteB) {
                return minuteA - minuteB;
            }
            if (secondA !== secondB) {
                return secondA - secondB;
            }

            return 0;
        };
        return connections.sort(comparePlayerConnections);
    }

    async getFriendRequests(playerId: string) {
        const friendsData = await this.getFriendData(playerId);
        return friendsData.receivedRequestList;
    }
}
