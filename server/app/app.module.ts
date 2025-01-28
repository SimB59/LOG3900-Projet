import { CardController } from '@app/controllers/card/card.controller';
import { ImageController } from '@app/controllers/image/image.controller';
import { GameManagerGateway } from '@app/gateways/game-manager/game-manager.gateway';
import { VideoReplayGateway } from '@app/gateways/video-replay-manager/video-replay-manager';
import { PlayerStats, statSchema } from '@app/model/database/player-stats';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { DifferencesDetectionService } from '@app/services/differences-detection/differences-detection.service';
import { HistoryService } from '@app/services/history/history.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import 'dotenv/config';
import { join } from 'path';
import { AccountController } from './controllers/account/account.controller';
import { AccountManagerGateway } from './gateways/account-manager/account-manager.gateway';
import { CardsManagerGateway } from './gateways/cards-manager/cards-manager.gateway';
import { ChatManagerGateway } from './gateways/chat-manager.gateway.ts/chat-manager.gateway';
import { Account, accountSchema } from './model/database/account';
import { AccountFriends, accountFriends } from './model/database/account-friends';
import { GameHistory, gameHistorySchema } from './model/database/game-history';
import { PlayerConnection, playerConnectionSchema } from './model/database/player-connection';
import { VideoReplay, videoReplaySchema } from './model/database/video-replay';
import { AccountService } from './services/account/account.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { ConstantsService } from './services/constants/constants.service';
import { FileService } from './services/file/file.service';
import { FriendService } from './services/friends/friends.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { EmailService } from './services/mail/mail.service';
import { PlayerConnectionService } from './services/player-connection/player-connection.service';
import { StatsService } from './services/stats/stats.service';
import { VideoReplayService } from './services/video-replay/video-replay.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: PlayerStats.name, schema: statSchema },
            { name: GameHistory.name, schema: gameHistorySchema },
            { name: Account.name, schema: accountSchema },
            { name: AccountFriends.name, schema: accountFriends },
            { name: PlayerConnection.name, schema: playerConnectionSchema },
            { name: VideoReplay.name, schema: videoReplaySchema },
        ]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '180m' },
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'assets/avatars'),
        }),
    ],
    controllers: [CardController, ImageController, AccountController],
    providers: [
        CardService,
        FriendService,
        DifferencesDetectionService,
        DatabaseService,
        GameManagerGateway,
        CardsManagerGateway,
        AccountManagerGateway,
        StatsService,
        FileService,
        HistoryService,
        ConstantsService,
        GameManagerService,
        AccountService,
        EmailService,
        AuthenticationService,
        ChatManagerGateway,
        PlayerConnectionService,
        VideoReplayGateway,
        VideoReplayService,
    ],
})
export class AppModule {}
