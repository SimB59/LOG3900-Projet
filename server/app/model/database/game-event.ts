import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameEventDocument = GameEvent & Document;

@Schema()
export class GameEvent {
    /*eslint-disable*/
    @Prop({ required: true })
    // eslint-disable-next-line @typescript-eslint/ban-types
    method: Function; // peut etre devoir changer pour string

    @Prop({ required: false })
    params: unknown[];

    @Prop({ required: true })
    timestamp: number;
}

export const gameEventSchema = SchemaFactory.createForClass(GameEvent);
