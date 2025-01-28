import { Component, Inject } from '@angular/core';
// eslint-disable-next-line import/no-deprecated
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss'],
})
export class EndGameComponent {
    // eslint-disable-next-line max-params
    constructor(
        protected gameService: GameService,
        protected translateService: TranslateService,
        protected videoReplayService: VideoReplayService,
        protected router: ActivatedRoute,
        // eslint-disable-next-line deprecation/deprecation, import/no-deprecated
        @Inject(MAT_DIALOG_DATA) public data: { isObserverMode: boolean },
    ) {}

    protected replay(): void {
        this.videoReplayService.indexEvent = 0;
        this.gameService.videoGameControlsAreVisible = true;
        this.videoReplayService.setSliderGotMoved(false);
        this.gameService.deleteMessage++;
        this.gameService.replay();
    }

    protected saveReplay(): void {
        this.gameService.saveReplay();
        this.videoReplayService.isSavedVideo = true;
    }

    // protected isLeaderboardPosition() {
    //     return (
    //         this.gameService.gameIsWon &&
    //         this.gameService.leaderboardPosition &&
    //         this.gameService.leaderboardPosition !== DEFAULT_LEADERBOARD_POSITION
    //     );
    // }
}
