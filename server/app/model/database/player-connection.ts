import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerConnectionDocument = PlayerConnection & Document;

export enum ConnectionType {
    LOGIN = 'login',
    LOGOUT = 'logout',
}

@Schema()
export class PlayerConnection {
    @Prop({ required: true })
    accountId: string;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    time: string;

    @Prop({ required: true, enum: ConnectionType })
    connectionType: ConnectionType;
}

export const playerConnectionSchema = SchemaFactory.createForClass(PlayerConnection);
