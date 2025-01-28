import { Friend } from '@common/friend';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AccountFriendsDocument = AccountFriends & Document;

@Schema()
export class AccountFriends {
    @Prop({ required: true })
    accountId: string;

    @Prop({ required: true })
    friendList: Friend[];

    @Prop({ required: true })
    requestSentList: Friend[];

    @Prop({ required: true })
    receivedRequestList: Friend[];

    @Prop({ required: true })
    blockedList: Friend[];

    @Prop({ required: true })
    blockedByList: Friend[];
}

export const accountFriends = SchemaFactory.createForClass(AccountFriends);
