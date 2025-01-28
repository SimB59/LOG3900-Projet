import { Injectable } from '@angular/core';
import { DrawService } from '@app/services/draw/draw.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameEvent } from '@common/game-event';
import { VideoReplay } from '@common/video-replay';
import { ALLOWED_REPLAY_SPEEDS, ASYNC_FUNCTION_WAITING_TIME, TIMER_INTERVAL } from './video-replay.service.constants';

@Injectable({
    providedIn: 'root',
})
export class VideoReplayService {
    isPlayingSavedVideo: boolean;
    indexEvent: number;
    isSavedVideo: boolean;
    private indexEventTemp: number;
    private sliderGotMoved: boolean;
    private gameEvents: GameEvent[];
    private speed: number;
    private timer: number;
    private isAborted: boolean;
    private isPaused: boolean;
    private startTimestamp: number;
    private shouldRegister: boolean;
    private isReplaying: boolean;
    private clueTimeoutIds: number[];
    private clueIntervalIds: number[];
    private publicAndOwnVideoReplay: VideoReplay[];
    private ownVideoReplays: VideoReplay[];
    private publicVideoReplays: VideoReplay[];
    private playerPseudo: string;

    constructor(private drawService: DrawService, private socketService: SocketClientService) {
        this.gameEvents = new Array();
        this.indexEvent = 0;
        this.isSavedVideo = false;
        this.ownVideoReplays = new Array();
        this.publicVideoReplays = new Array();
        this.resetAttributes();
        this.handleSocket();
    }

    get isInReplayMode() {
        return this.isReplaying;
    }

    get isInAbortedState() {
        return this.isAborted;
    }

    get isInPausedState() {
        return this.isPaused;
    }

    getSliderGotMoved(): boolean {
        return this.sliderGotMoved;
    }
    getOwnedVideoReplays(): VideoReplay[] {
        return this.ownVideoReplays;
    }

    getPublicVideoReplays(): VideoReplay[] {
        return this.publicVideoReplays;
    }

    getGameEvents(): GameEvent[] {
        return this.gameEvents;
    }

    getIsAborted(): boolean {
        return this.isAborted;
    }

    setSliderGotMoved(value: boolean): void {
        this.sliderGotMoved = value;
    }

    clearGameEvents() {
        this.gameEvents = new Array();
    }

    addGameEvent(gameEvent: GameEvent) {
        this.gameEvents.push(gameEvent);
    }

    addClueTimeoutId(timeoutId: number) {
        this.clueTimeoutIds.push(timeoutId);
    }

    addClueIntervalId(timeoutId: number) {
        this.clueTimeoutIds.push(timeoutId);
    }

    register(gameEvent: GameEvent): void {
        if (this.shouldRegister) {
            // startGame is the first method that is registered when a game is started
            if (gameEvent.method.name === 'startGame') {
                this.gameEvents = new Array();
                this.startTimestamp = gameEvent.timestamp;
            }
            gameEvent.timestamp -= this.startTimestamp;
            this.gameEvents.push(gameEvent);
        }
    }

    setStartingTime(startingTimestamp: number): void {
        this.startTimestamp = startingTimestamp;
    }

    setSpeed(newSpeed: number): void {
        if (ALLOWED_REPLAY_SPEEDS.includes(newSpeed)) this.speed = newSpeed;
    }

    stop(): void {
        this.isAborted = true;
        this.shouldRegister = true;
    }

    stopWithRegister(): void {
        this.isAborted = true;
        this.shouldRegister = false;
    }

    updateTimer(newTime: number): void {
        this.timer = newTime;
    }

    play(): void {
        this.isPaused = false;
    }

    pause(): void {
        this.isPaused = true;
    }

    filterVideoReplaysByCardName(cardName: string, isPublic: boolean): void {
        if (cardName === '') {
            this.displayAll();
            return;
        }
        if (isPublic) {
            for (const replay of this.publicVideoReplays) {
                if (replay.cardName.toLowerCase().indexOf(cardName.toLowerCase()) >= 0) replay.shouldDisplay = true;
                else replay.shouldDisplay = false;
            }
        } else {
            for (const replay of this.ownVideoReplays) {
                if (replay.cardName.toLowerCase().indexOf(cardName.toLowerCase()) >= 0) replay.shouldDisplay = true;
                else replay.shouldDisplay = false;
            }
        }
    }

    filterVideoReplaysByPseudo(pseudo: string, isPublic: boolean): void {
        if (pseudo === '') {
            this.displayAll();
            return;
        }
        if (isPublic) {
            for (const replay of this.publicVideoReplays) {
                if (replay.playerSharingName.toLowerCase().indexOf(pseudo) >= 0) replay.shouldDisplay = true;
                else replay.shouldDisplay = false;
            }
        } else {
            for (const replay of this.ownVideoReplays) {
                if (replay.playerSharingName.toLowerCase().indexOf(pseudo) >= 0) replay.shouldDisplay = true;
                else replay.shouldDisplay = false;
            }
        }
    }

    async movedSlider(value: number): Promise<void> {
        this.sliderGotMoved = true;
        // peut-être pas nécessaire
        this.indexEventTemp = this.indexEvent;
        this.indexEvent = value;
        await new Promise((resolve) => {
            const waitForPreviousReplayCompleted = () => {
                if (!this.isReplaying) {
                    resolve(true);
                } else {
                    setTimeout(waitForPreviousReplayCompleted, TIMER_INTERVAL);
                }
            };
            waitForPreviousReplayCompleted();
        });
        this.setUpQuickReplay();
    }

    async restart(): Promise<void> {
        this.indexEvent = 0;
        this.stop();

        await new Promise((resolve) => {
            const waitForPreviousReplayCompleted = () => {
                if (!this.isReplaying) {
                    resolve(true);
                } else {
                    setTimeout(waitForPreviousReplayCompleted, TIMER_INTERVAL);
                }
            };
            waitForPreviousReplayCompleted();
        });

        this.replay();
    }

    async replay(): Promise<void> {
        if (!this.sliderGotMoved) {
            this.drawService.resetModifiedImageToInitialState();
            this.resetAttributes();
        } else this.sliderGotMoved = false;

        this.isReplaying = true;
        this.shouldRegister = false;

        for (this.indexEvent; this.indexEvent < this.gameEvents.length; this.indexEvent++) {
            await this.executeGameEvent(this.gameEvents[this.indexEvent]);
            if (this.isAborted) break;
        }
        // Laisser ce code ici pour le moment -- Sidney 8 avril 2024
        // for (const gameEvent of this.gameEvents) {
        //     await this.executeGameEvent(gameEvent);
        //     if (this.isAborted) break;
        // }
        this.stop();
        this.clearClues();
        // We must wait for the end of the async functions
        // that have been called to prevent unexpected behavior
        await new Promise((resolve) => setTimeout(resolve, ASYNC_FUNCTION_WAITING_TIME));
        this.isReplaying = false;
    }

    async getVideoReplay(accountId: string, pseudo: string): Promise<void> {
        this.playerPseudo = pseudo;
        this.socketService.sendVideoReplayRequest('getVideoReplay', accountId);
    }

    handleSocket() {
        this.socketService.addCallbackToMessageVideoReplaySocket('getVideoReplay', (videoReplays) => {
            this.publicAndOwnVideoReplay = JSON.parse(videoReplays as string);
            // passer directement les videoReplays dans splitVideoReplay sans assigner à une variable
            this.splitVideoReplay(this.publicAndOwnVideoReplay);
        });
    }

    private async setUpQuickReplay(): Promise<void> {
        this.timer = 0;
        this.indexEvent = this.indexEventTemp;
        this.drawService.resetModifiedImageToInitialState();

        this.shouldRegister = false;
        this.isAborted = false;
    }

    private displayAll(): void {
        for (const replay of this.publicVideoReplays) {
            replay.shouldDisplay = true;
        }
        for (const replay of this.ownVideoReplays) {
            replay.shouldDisplay = true;
        }
    }

    private splitVideoReplay(videoReplay: VideoReplay[]): void {
        this.ownVideoReplays = [];
        this.publicVideoReplays = [];
        for (const replay of videoReplay) {
            if (replay.playerSharingName === this.playerPseudo) {
                replay.shouldDisplay = true;
                this.ownVideoReplays.push(replay);
            }
            if (replay.isPublic) {
                replay.shouldDisplay = true;
                this.publicVideoReplays.push(replay);
            }
        }
    }

    private async executeGameEvent(gameEvent: GameEvent) {
        return new Promise((resolve) => {
            const executeOnTimestamp = () => {
                if (this.isAborted) {
                    resolve(false);
                    return;
                }
                if (!this.isPaused) this.timer += TIMER_INTERVAL * this.speed;

                if (this.timer >= gameEvent.timestamp) {
                    resolve(this.execute(gameEvent));
                } else {
                    setTimeout(executeOnTimestamp, TIMER_INTERVAL);
                }
            };
            executeOnTimestamp();
        });
    }

    private resetAttributes(): void {
        this.clueTimeoutIds = new Array();
        this.clueIntervalIds = new Array();
        this.speed = 1;
        this.timer = 0;
        this.isAborted = false;
        this.isPaused = false;
        this.isReplaying = false;
        this.shouldRegister = true;
    }

    private clearClues(): void {
        for (const timeoutId of this.clueTimeoutIds) {
            clearTimeout(timeoutId);
        }
        for (const intervalId of this.clueIntervalIds) {
            clearInterval(intervalId);
        }
    }

    private execute(gameEvent: GameEvent): void {
        if (gameEvent.method.name === 'toggleCheatMode') {
            gameEvent.method.call(gameEvent.this, this.speed);
        } else if (gameEvent.method.name === 'startGame') {
            gameEvent.params = [true, true];
            gameEvent.method.call(gameEvent.this, ...gameEvent.params);
        } else if (gameEvent.params) {
            gameEvent.method.call(gameEvent.this, ...gameEvent.params);
        } else {
            gameEvent.method.call(gameEvent.this);
        }
    }
}
