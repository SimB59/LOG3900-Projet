import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameHistoryDocument = GameHistory & Document;

@Schema()
export class GameHistory {
    @Prop({ required: true })
    accountId: string;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    time: string;

    @Prop({ required: true })
    isWinner: boolean;

    @Prop({ required: true })
    duration: number;

    @Prop({ required: true })
    numberOfDifferenceFound: number;

    @Prop({ required: true })
    firstMode: string;

    @Prop({})
    gameId: string;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
