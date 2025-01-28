import { VideoReplay } from '@app/model/database/video-replay';
import { DatabaseService } from '@app/services/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoReplayService {
    constructor(private readonly databaseService: DatabaseService) {}

    async saveReplay(replay: VideoReplay): Promise<void> {
        await this.databaseService.createVideoReplay(replay);
    }

    async getVideoReplay(accountId: string): Promise<VideoReplay[]> {
        // console.log('getVideoReplay before databaseService : ', pseudo);
        return await this.databaseService.getVideoReplays(accountId);
        // console.log('saveReplay before databaseService', replay);
    }

    async searchVideoReplayCardName(cardName: string): Promise<VideoReplay[]> {
        return await this.databaseService.findVideoReplays({
            $and: [{ cardName: { $regex: `^${cardName}` } }, { isPublic: true }],
        });
    }

    async searchVideoReplayPlayerName(pseudo: string): Promise<VideoReplay[]> {
        return await this.databaseService.findVideoReplays({
            $and: [{ playerSharingName: { $regex: `^${pseudo}` } }, { isPublic: true }],
        });
    }

    async getPersonalVideoReplay(accountId: string): Promise<VideoReplay[]> {
        return await this.databaseService.findVideoReplays({
            accountId,
        });
    }

    async changeVisibility(videoId: string): Promise<VideoReplay[]> {
        const videoReplay: VideoReplay = await this.databaseService.findVideoReplay({ videoId });
        videoReplay.isPublic = !videoReplay.isPublic;
        await this.databaseService.updateVideoReplay({ videoId }, videoReplay);
        return await this.databaseService.getVideoReplays(videoReplay.playerSharingName);
    }

    async changeVisibilityWithOutEmit(videoId: string): Promise<void> {
        const videoReplay: VideoReplay = await this.databaseService.findVideoReplay({ videoId });
        videoReplay.isPublic = !videoReplay.isPublic;
        await this.databaseService.updateVideoReplay({ videoId }, videoReplay);
    }

    async deleteVideoReplay(videoId: string): Promise<VideoReplay> {
        const videoReplay: VideoReplay = await this.databaseService.findVideoReplay({ videoId });
        await this.databaseService.deleteVideoReplay({ videoId });
        return videoReplay;
    }

    async deleteVideoReplayHeavy(videoId: string, accountId: string): Promise<VideoReplay[]> {
        await this.databaseService.deleteVideoReplay({ videoId });
        return await this.databaseService.getVideoReplays(accountId);
    }
}
