import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerHistoryDocument = PlayerHistory & Document;

@Schema()
export class PlayerHistory {
    @Prop({ required: true })
    timestamp: number;

    @Prop({ required: true })
    isPositive: boolean;

    @Prop({ required: true })
    isGameData: boolean;
}

export const playerHistorySchema = SchemaFactory.createForClass(PlayerHistory);
