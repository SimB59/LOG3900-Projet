import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameConstantsShared } from './game-constants';
import { GameEvent } from './game-event';

export type VideoReplayDocument = VideoReplay & Document;

@Schema()
export class VideoReplay {
    @Prop({ required: true })
    videoId: string;

    @Prop({ required: true })
    gameEvents: GameEvent[];

    @Prop({ required: true })
    playerOpponentNames: string[];

    @Prop({ required: true })
    playerSharingName: string;

    @Prop({ required: true })
    cardId: string;

    @Prop({ required: true })
    cardName: string;

    @Prop({ required: true })
    pseudo: string;

    @Prop({ required: true })
    accountId: string;

    @Prop({ required: true })
    constants: GameConstantsShared;

    @Prop({ required: true })
    isPublic: boolean;

    @Prop({ required: true })
    date: string;
}

export const videoReplaySchema = SchemaFactory.createForClass(VideoReplay);
