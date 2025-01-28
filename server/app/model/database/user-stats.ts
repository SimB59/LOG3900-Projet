import { Prop, Schema } from '@nestjs/mongoose';

export type PlayerHistoryDocument = UserStats & Document;

@Schema()
export class UserStats {
    @Prop({ required: true })
    gamesPlayed: number;

    @Prop({ required: true })
    gamesWon: number;

    @Prop({ required: true })
    meanDifferencesFoundPerGame: number;

    @Prop({ required: true })
    timeMeanPerGame: number;
}
