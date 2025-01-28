import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';

@Component({
    selector: 'app-video-replay-control',
    templateUrl: './video-replay-control.component.html',
    styleUrls: ['./video-replay-control.component.scss'],
})
export class VideoReplayControlComponent {
    @ViewChild('firstSpeedSelector') inputFirstSpeed: ElementRef<HTMLInputElement>;
    @ViewChild('timeStampSlider') sliderRef: ElementRef<HTMLInputElement>;
    protected isPlaying: boolean;
    protected isPaused: boolean;

    // eslint-disable-next-line max-params
    constructor(
        protected videoReplayService: VideoReplayService,
        private gameService: GameService,
        private messageService: MessageService,
        protected translateService: TranslateService,
    ) {
        this.isPlaying = true;
        this.isPaused = false;
        this.gameService.disableKeyListener();
    }

    async cursorMoved() {
        this.videoReplayService.stopWithRegister();
        await this.videoReplayService.movedSlider(+this.sliderRef.nativeElement.value); // no more async afteer this
        this.gameService.videoReplayMovedSlider(+this.sliderRef.nativeElement.value, this.videoReplayService.getGameEvents());
    }

    stop(): void {
        this.videoReplayService.stop();
        this.videoReplayService.isPlayingSavedVideo = false;
        this.gameService.videoGameControlsAreVisible = false;
        this.gameService.resetGame();
        this.gameService.navigate('/home');
    }

    play(): void {
        this.isPlaying = true;
        this.isPaused = false;
        this.videoReplayService.play();
        if (this.videoReplayService.getSliderGotMoved()) this.cursorMoved();
    }

    pause(): void {
        this.isPlaying = false;
        this.isPaused = true;
        this.videoReplayService.pause();
    }

    async restart(): Promise<void> {
        this.isPlaying = true;
        this.isPaused = false;
        this.inputFirstSpeed.nativeElement.checked = true;
        this.messageService.clearMessages();
        this.gameService.restart();
    }

    setSpeed(speed: number) {
        this.videoReplayService.setSpeed(speed);
    }
}
