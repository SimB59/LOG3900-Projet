import { Component, Input } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { VideoReplay } from '@common/video-replay';

@Component({
    selector: 'app-video-replay',
    templateUrl: './video-replay.component.html',
    styleUrls: ['./video-replay.component.scss'],
})
export class VideoReplayComponent {
    @Input() videoReplay: VideoReplay;
    @Input() isOwner: boolean;

    constructor(private gameService: GameService, protected themeService: ThemeService, protected translationService: TranslateService) {}

    async launchVideoReplay(): Promise<void> {
        await this.gameService.launchVideoReplay(this.videoReplay);
    }

    deleteVideoReplay(event: Event): void {
        event.stopPropagation();
        this.gameService.deleteVideoReplay(this.videoReplay.videoId);
    }

    changeVisibility(event: Event): void {
        event.stopPropagation();
        this.gameService.changeVisibilityWithOutEmit(this.videoReplay.videoId);
    }
}
