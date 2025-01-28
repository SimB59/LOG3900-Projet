import { Friend } from '@common/friend';

export interface AccountFriends {
    accountId: string;
    friendList: Friend[];
    requestSentList: Friend[];
    receivedRequestList: Friend[];
    blockedList: Friend[];
    blockedByList: Friend[];
}
