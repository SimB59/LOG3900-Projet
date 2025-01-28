import { Language } from '@app/model/interfaces/language';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Theme } from 'app/model/interfaces/theme';
import { Document } from 'mongoose';
import { UserStats } from './user-stats';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
    @Prop({ required: true })
    accountId: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    pseudo: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    avatarPictureId: string;

    @Prop({ required: true })
    accountStats: UserStats;

    @Prop({ required: true })
    accountLevel: number;

    @Prop({ required: true })
    accountRank: number;

    @Prop({ required: true })
    currency: number;

    @Prop({ required: true })
    language: Language;

    @Prop({ required: true })
    theme: Theme;
}

export const accountSchema = SchemaFactory.createForClass(Account);
