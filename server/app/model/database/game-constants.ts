import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GameConstantsDocument = GameConstantsShared & Document;

@Schema()
export class GameConstantsShared {
    @Prop({ required: true })
    initial: number;

    @Prop({ required: false })
    penalty: number;

    @Prop({ required: false })
    gain: number;

    @Prop({ required: false })
    isCheatMode: boolean;
}

export const gameEventsSharedSchema = SchemaFactory.createForClass(GameConstantsShared);
