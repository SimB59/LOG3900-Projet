/* eslint-disable max-lines */
// Disable max lines because file is central to the client and needs all the methods
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { VALIDITY_CHECK_TIMEOUT } from '@app/components/name-query/name-query.component.constants';
import { Game } from '@app/interfaces/game';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { CommunicationService } from '@app/services/communication/communication.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PlayerService } from '@app/services/player/player.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SoundService } from '@app/services/sound/sound.service';
import { TimerService } from '@app/services/timer/timer.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';
import { ViewManipulatorService } from '@app/services/view-manipulator/view-manipulator.service';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { GameEvent } from '@common/game-event';
import { GameEventShared } from '@common/game-event-shared';
import { LimitedTimeIO } from '@common/limited-time-io';
import { SuccessClick } from '@common/success-click';
import { VideoReplay } from '@common/video-replay';
import { Winner } from '@common/winner';
import { Subject, firstValueFrom } from 'rxjs';
import { BLINK_ANIMATION_TIME, DEFAULT_LEADERBOARD_POSITION, ERROR_WAIT_TIME, GAME_CONSTANTS_DEFAULT } from './game.service.constants';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    gameLimitedIsQuit: boolean;
    gameIsWatched: boolean;
    errorPosition: Coordinate;
    errorVisibility: boolean;
    lobbyWaitingVisibility: boolean;
    endPopUpSubject: Subject<boolean>;
    videoGameControlsAreVisible: boolean;
    leaderboardPosition: number;
    gameConstants: GameConstants;
    isMultiplayer: boolean;
    deleteMessage: number;
    isObserver: boolean;
    differenceFoundPositions: Coordinate[][];
    observerCount: number;
    private game: Game;
    private intervalIdCheatMode: number;
    private eventListenerRef: (this: Window, ev: KeyboardEvent) => unknown;
    private cheatMode: boolean;
    private isWinner: boolean;
    private endPopUpVisibility: boolean;
    private startFlash: number;
    private backupDifferencesVideoReplay: Coordinate[][];
    private dataLightClient;
    // Disable lint because this is main service and require all other services
    // eslint-disable-next-line max-params
    constructor(
        public playerService: PlayerService,
        private mouseService: MouseService,
        private communicationService: CommunicationService,
        private soundService: SoundService,
        private viewService: ViewManipulatorService,
        private timeService: TimerService,
        private socketService: SocketClientService,
        private videoReplayService: VideoReplayService,
        private router: Router,
    ) {
        this.game = { id: '', gameTitle: '', firstMode: '', secondMode: '', difficulty: '', differences: [], differencesBackup: [] };
        this.differenceFoundPositions = [];
        this.cheatMode = false;
        this.errorVisibility = false;
        this.endPopUpVisibility = false;
        this.endPopUpSubject = new Subject<boolean>();
        this.videoGameControlsAreVisible = false;
        this.gameConstants = GAME_CONSTANTS_DEFAULT;
        this.deleteMessage = 0;
        this.handleSocket();
        this.isObserver = false;
        this.backupDifferencesVideoReplay = new Array();
        this.dataLightClient = '';
        this.gameLimitedIsQuit = false;
    }

    get gameData() {
        return this.game;
    }

    get isClassicMode() {
        return this.game.firstMode === FirstGameMode.CLASSIC;
    }

    get selfName() {
        return this.playerService.selfName;
    }

    get opponentName() {
        return this.playerService.opponentName;
    }

    get selfDiffCount() {
        return this.playerService.selfDiffCount;
    }

    get opponentDiffCount() {
        return this.playerService.opponentDiffCount;
    }

    get gameIsWon() {
        return this.isWinner;
    }

    async replay(): Promise<void> {
        this.setEndPopUpVisibility(false);
        this.playerService.resetCounter();
        this.videoReplayService.replay();
    }

    async restart(): Promise<void> {
        this.playerService.resetCounter();
        this.videoReplayService.restart();
    }

    loadGame(game: Game) {
        this.game = game;
    }

    async enterGameAsObserver(id: string, mode: FirstGameMode, players: string[]) {
        this.isObserver = true;
        this.game.firstMode = mode;
        this.playerService.setOpponentPlayer(JSON.stringify(players), true);
        if (mode === FirstGameMode.CLASSIC) {
            const gameData = await firstValueFrom(this.communicationService.getRequest(`card/${id}`));
            if (gameData) {
                const data = JSON.parse(gameData.body);
                this.game = {
                    id: data.id,
                    gameTitle: data.title,
                    differences: data.differences,
                    differencesBackup: data.differences,
                    firstMode: mode,
                } as Game;
            }
        } else {
            this.game = {
                id: FirstGameMode.LIMITED_TIME,
                gameTitle: FirstGameMode.LIMITED_TIME,
                firstMode: FirstGameMode.LIMITED_TIME,
                differences: [],
            } as unknown as Game;
        }
    }

    enterGame() {
        this.startGame(true, this.isClassicMode);
        this.lobbyWaitingVisibility = true;
        this.waitForCardValidity();
        this.gameLimitedIsQuit = false;
    }

    enterGameAsSharedVideoReplay(videoReplay: VideoReplay) {
        // voir si la fonction fonctionne
        this.playerService.setOpponentPlayer(videoReplay.playerOpponentNames.join(','), true);
        // voir si cela fonctionne
        this.playerService.setSelfName = videoReplay.playerSharingName;
        this.gameConstants = videoReplay.constants;
        // this.videoReplayService.setGameEvents(videoReplay.gameEvents); faire le switch case
        this.setGameEventsFromSharedVideoReplay(videoReplay.gameEvents);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate(route: string, params?: any) {
        this.router.navigate([route], { queryParams: params });
    }

    waitForCardValidity() {
        // Algorithm source : https://stackoverflow.com/questions/22125865/how-to-wait-until-a-predicate-condition-becomes-true-in-javascript
        if (this.gameData.id === FirstGameMode.LIMITED_TIME) {
            window.setTimeout(this.waitForCardValidity.bind(this), VALIDITY_CHECK_TIMEOUT);
        } else {
            this.lobbyWaitingVisibility = false;
            this.navigate('/game');
        }
    }

    async startGame(isMultiplayer: boolean = false, isClassic: boolean = true) {
        if (!this.videoReplayService.isInReplayMode) {
            this.lobbyWaitingVisibility = true;
            this.videoReplayService.isSavedVideo = false;
        }
        this.registerEvent({ this: this, method: this.startGame, params: [this.dataLightClient], timestamp: Date.now() });
        this.isMultiplayer = isMultiplayer;
        this.leaderboardPosition = DEFAULT_LEADERBOARD_POSITION;
        this.resetGame();
        if (isClassic && !this.videoReplayService.isInReplayMode) {
            this.timeService.updateTime(0);
            const gameData = await firstValueFrom(this.communicationService.getRequest(`card/${this.game.id}`));
            const differences = JSON.parse(gameData.body).differences;
            this.game.differences = differences;
            this.game.differencesBackup = differences;
        } else if (this.videoReplayService.isInReplayMode) {
            if (this.backupDifferencesVideoReplay.length > 0) {
                for (const diff of this.backupDifferencesVideoReplay) {
                    this.game.differences.push(diff);
                }
            }
            this.backupDifferencesVideoReplay = new Array();
        }
        this.setEndPopUpVisibility(false);
        this.enableKeyListener();
        this.mouseService.toggleClick(false);
    }

    async validateDifference(event: MouseEvent) {
        const mousePos = this.mouseService.mouseHitDetect(event);
        this.setErrorPosition(event.clientX, event.clientY);
        if (mousePos) this.socketService.send('handleClick', JSON.stringify(mousePos));
    }

    abandonGame(surrender: boolean = false) {
        this.isObserver = false;
        this.videoReplayService.isPlayingSavedVideo = false;
        this.videoReplayService.isSavedVideo = false;
        this.videoReplayService.indexEvent = 0;
        this.setEndPopUpVisibility(false);
        this.videoGameControlsAreVisible = false;
        if (surrender) this.socketService.send('surrender');
        this.resetGame();
        this.navigate('/home');
    }

    enableKeyListener() {
        this.eventListenerRef = this.catchEvent.bind(this);
        addEventListener('keydown', this.eventListenerRef);
    }

    disableKeyListener() {
        removeEventListener('keydown', this.eventListenerRef);
    }

    registerEvent(gameEvent: GameEvent) {
        this.videoReplayService.register(gameEvent);
    }

    getEndPopUpVisibility() {
        return this.endPopUpVisibility;
    }

    setEndPopUpVisibility(visibility: boolean) {
        if (this.endPopUpVisibility !== visibility) {
            this.endPopUpVisibility = visibility;
            this.endPopUpSubject.next(this.endPopUpVisibility);
        }
    }

    resetGame() {
        for (const diff of this.differenceFoundPositions) {
            this.backupDifferencesVideoReplay.push(diff);
        }
        this.differenceFoundPositions = [];
        this.errorVisibility = false;
        this.cheatMode = false;
        this.mouseService.toggleClick(false);
        this.disableKeyListener();
        this.deactivateCheatMode();
    }

    // eslint-disable-next-line max-params
    observerInteraction(coords: Coordinate[], players: string[], isRightSide: boolean) {
        this.socketService.send(
            'observerInteraction',
            JSON.stringify({ coords, playerTarget: players, sender: this.socketService.socketId, isRightSide }),
        );
    }

    saveReplay() {
        // console.log('this.gameEvents', this.videoReplayService.getGameEvents());
        let videoReplay = {} as VideoReplay;
        videoReplay.gameEvents = [];
        videoReplay.playerOpponentNames = [];
        videoReplay.playerSharingName = '';
        videoReplay.videoId = '';
        videoReplay.isPublic = false;

        videoReplay = this.setReplayEvents(videoReplay);
        this.playerService.opponentPlayers.forEach((player) => {
            videoReplay.playerOpponentNames.push(player.pseudo);
        });
        videoReplay = this.setReplayAttributes(videoReplay);

        this.socketService.send('saveReplay', JSON.stringify(videoReplay));
    }

    videoReplayMovedSlider(index: number, events: GameEvent[]) {
        this.playerService.resetCounter();

        if (!this.videoReplayService.isInPausedState) {
            for (let i = 0; i <= index; i++) {
                if (this.videoReplayService.getIsAborted()) break;
                // mettre une validation de temps ici après que ça fonctionne
                // if(this.gameEvents[i].timestamp >= this.indexEventTemp){
                //     break;
                // }
                switch (events[i].method.name) {
                    case 'handleSuccess':
                        /*eslint-disable */
                        const successEvent = JSON.parse(events[i].params![0]) as SuccessClick;
                        this.showClickedDifferenceWithoutFlash(successEvent.differences, successEvent.pseudo);
                        break;
                    case 'toggleCheatMode':
                        this.startFlash++;
                        break;
                    case 'updateTime':
                        this.timeService.updateTime(+events[i].params![0]);
                        break;
                    case 'startGame':
                        this.enterGame();
                        break;
                    case 'stopFlash':
                        this.startFlash++;
                        break;
                    case 'stopFlash':
                        this.startFlash--;
                        break;
                    // default:
                }
            }
            if (this.startFlash % 2 === 1) {
                this.toggleCheatMode();
            }
            //   play rest of the events as usual but make sure to toggleCheatMode() if startFlash is odd
            if (index === events.length - 1) {
                this.videoReplayService.updateTimer(0);
                this.videoReplayService.stop();
                //show pop up end
                this.setEndPopUpVisibility(true);
            } else {
                this.videoReplayService.indexEvent = index + 1; // à vérifier
                this.videoReplayService.updateTimer(events[index + 1].timestamp);
                this.videoReplayService.replay();
            }
        }
    }

    deleteVideoReplay(videoId: string) {
        const obj = { videoId, accountId: this.playerService.accountService.accountId };
        this.socketService.sendVideoReplayRequest('deleteVideoReplayHeavy', JSON.stringify(obj));
    }

    changeVisibilityWithOutEmit(videoId: string) {
        this.socketService.sendVideoReplayRequest('changeVisibilityWithOutEmit', videoId);
    }

    async launchVideoReplay(videoReplay: VideoReplay): Promise<void> {
        this.resetGame();
        this.videoReplayService.clearGameEvents();
        this.videoReplayService.isPlayingSavedVideo = true;
        this.router.navigate(['/game']);
        await this.applyReplayGameAttributes(videoReplay);
        this.setGameEventsFromSharedVideoReplay(videoReplay.gameEvents);
        this.videoReplayService.setStartingTime(videoReplay.gameEvents[0].timestamp);
        // this.videoReplayService.isInReplayMode = true
        // mettre à false une fois terminé
        this.endPopUpVisibility = false;
        this.videoGameControlsAreVisible = true;
        this.videoReplayService.indexEvent = 0;
        this.videoReplayService.replay();
    }

    private setReplayEvents(videoReplay: VideoReplay): VideoReplay {
        this.videoReplayService.getGameEvents().map((gameEvent) => {
            videoReplay.gameEvents.push({
                method: gameEvent.method.name,
                params: gameEvent.params,
                timestamp: gameEvent.timestamp,
            } as GameEventShared);
        });
        return videoReplay;
    }

    private setReplayAttributes(videoReplay: VideoReplay): VideoReplay {
        videoReplay.constants = this.gameConstants;
        videoReplay.playerSharingName = this.playerService.accountService.pseudo;
        videoReplay.pseudo = this.playerService.accountService.pseudo;
        videoReplay.accountId = this.playerService.accountService.accountId;
        videoReplay.cardName = this.game.gameTitle;
        videoReplay.cardId = this.game.id;
        videoReplay.videoId = this.playerService.accountService.pseudo + '_' + this.game.id + '_' + Date.now();
        videoReplay.date = '';
        videoReplay.date = this.setDate();
        return videoReplay;
    }

    private setDate(): string {
        const date = new Date();
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    private async applyReplayGameAttributes(videoReplay: VideoReplay): Promise<void> {
        this.playerService.clearPlayers();
        this.game.firstMode = FirstGameMode.CLASSIC;
        this.gameConstants = videoReplay.constants;
        this.playerService.setSelfName = videoReplay.playerSharingName;
        this.game.gameTitle = videoReplay.cardName;
        this.game.id = videoReplay.cardId;
        videoReplay.playerOpponentNames.forEach((pseudo) => {
            this.playerService.opponentPlayers.push({ pseudo, differenceCount: 0, rank: 0 });
            this.socketService.sendAccountInfo('getRank', pseudo);
        });
        const gameData = await firstValueFrom(this.communicationService.getRequest(`card/${this.game.id}`));
        const differences = JSON.parse(gameData.body).differences;
        this.game.differences = differences;
        this.game.differencesBackup = differences;
    }

    private showClickedDifferenceWithoutFlash(difference: Coordinate[], pseudo: string) {
        this.playerService.incrementPlayerDiffCount(pseudo, false);
        if (this.isClassicMode) {
            this.differenceFoundPositions.push(difference);
            this.viewService.draw(difference);
            this.game.differences.splice(this.findIndex(difference), 1);
        }
    }

    private setErrorPosition(x: number, y: number) {
        // Not needed anymore since the error signal is located at the top of th game screen -- Sidney 28/03/2024
        // this.registerEvent({ this: this, method: this.setErrorPosition, params: [x, y], timestamp: Date.now() });
        if (!this.errorVisibility) this.errorPosition = { x, y };
    }

    private findIndex(array: Coordinate[]): number {
        let counter = 0;
        let index = 0;
        this.game.differences.forEach((diffArr) => {
            if (diffArr.length === array.length && JSON.stringify(diffArr[0]) === JSON.stringify(array[0])) {
                index = counter;
            }
            counter++;
        });
        return index;
    }

    private catchEvent(event: KeyboardEvent) {
        if (event.key === 't' && this.gameConstants.isCheatMode) {
            this.toggleCheatMode();
        }
    }

    private toggleCheatMode(speed: number = 1) {
        this.registerEvent({ this: this, method: this.toggleCheatMode, timestamp: Date.now() });
        if (this.cheatMode) {
            this.deactivateCheatMode(speed);
        } else {
            this.activateCheatMode(speed);
        }
        this.cheatMode = !this.cheatMode;
    }

    private activateCheatMode(speed: number = 1) {
        this.intervalIdCheatMode = window.setInterval(() => {
            if (!(this.videoReplayService.isInReplayMode && this.videoReplayService.isInPausedState)) {
                this.game.differences.forEach((diffArr) => {
                    this.viewService.blinkPixels(diffArr, speed);
                });
            }
        }, BLINK_ANIMATION_TIME);
    }

    private deactivateCheatMode(speed: number = 1) {
        if (this.intervalIdCheatMode) {
            window.clearInterval(this.intervalIdCheatMode);
            this.viewService.resetModImage(this.differenceFoundPositions, speed);
        }
    }

    private handleSuccess(data: string) {
        const successInfo = JSON.parse(data) as SuccessClick;
        this.soundService.success();
        
        if (this.isClassicMode) {
            this.playerService.incrementPlayerDiffCount(successInfo.pseudo, this.isObserver);
            if (!this.cheatMode) this.viewService.activateBlinkingAnimation(successInfo.differences);
            this.differenceFoundPositions.push(successInfo.differences);
            this.game.differences.splice(this.findIndex(successInfo.differences), 1);
        }
        else {
            this.playerService.incrementSelfDiffCount(this.isObserver);
        }
    }

    private handleError() {
        this.errorVisibility = true;
        this.soundService.error();
        this.mouseService.toggleClick(true);
        setTimeout(() => {
            this.mouseService.toggleClick(false);
            this.errorVisibility = false;
        }, ERROR_WAIT_TIME);
    }

    private handleWinner(winnerData: Winner) {
        this.isWinner = winnerData.socketId === this.socketService.socketId;
        this.leaderboardPosition = winnerData.leaderboardPosition;
        this.endGame();
    }

    private handleCardChange(limitedTimeIO: LimitedTimeIO) {
        this.game = {
            id: limitedTimeIO.card.id,
            gameTitle: limitedTimeIO.card.title,
            firstMode: FirstGameMode.LIMITED_TIME,
            difficulty: limitedTimeIO.card.difficultyLevel,
            differences: [limitedTimeIO.card.differences[limitedTimeIO.differenceIndex]],
        } as Game;
    }

    private endGame() {
        this.gameIsWatched = false;
        this.setEndPopUpVisibility(true);
        this.isObserver = false;
        this.socketService.send('endGame');
        this.resetGame();
        this.mouseService.toggleClick(true);
    }

    private handleEndGame(isWinner: boolean) {
        this.isWinner = isWinner;
        this.endGame();
    }

    // private setToSolo() {
    //     this.isMultiplayer = false;
    // }

    private updateConstants(constants: string) {
        this.gameConstants = JSON.parse(constants) as GameConstants;
    }

    private setGameEventsFromSharedVideoReplay(gameEvents: GameEventShared[]) {
        // La fonction est ici, car je dois utiliser "this" et je ne peux pas le faire dans video-replay.service.ts
        // car il y aurait une dépendance circulaire -- Sidney 01/04/2024
        gameEvents.forEach((gameEvent) => {
            switch (gameEvent.method) {
                case 'updateTime':
                    this.videoReplayService.addGameEvent({
                        this: this.timeService,
                        method: this.timeService.updateTime,
                        params: gameEvent.params,
                        timestamp: gameEvent.timestamp,
                    });
                    break;
                case 'startGame':
                    this.videoReplayService.addGameEvent({
                        this: this,
                        method: this.startGame,
                        params: gameEvent.params,
                        timestamp: gameEvent.timestamp,
                    });
                    break;
                case 'handleSuccess':
                    this.videoReplayService.addGameEvent({
                        this: this,
                        method: this.handleSuccess,
                        params: gameEvent.params,
                        timestamp: gameEvent.timestamp,
                    });
                    break;
                case 'handleError':
                    this.videoReplayService.addGameEvent({ this: this, method: this.handleError, timestamp: gameEvent.timestamp });
                    break;
                case 'handleWinner':
                    this.videoReplayService.addGameEvent({
                        this: this,
                        method: this.handleWinner,
                        params: gameEvent.params,
                        timestamp: gameEvent.timestamp,
                    });
                    break;
                case 'toggleCheatMode':
                    this.videoReplayService.addGameEvent({ this: this, method: this.toggleCheatMode, timestamp: gameEvent.timestamp });
                    break;
                case 'validateDifference':
                    this.videoReplayService.addGameEvent({
                        this: this,
                        method: this.validateDifference,
                        params: gameEvent.params,
                        timestamp: gameEvent.timestamp,
                    });
                    break;
                case 'abandonGame':
                    this.videoReplayService.addGameEvent({
                        this: this,
                        method: this.abandonGame,
                        params: gameEvent.params,
                        timestamp: gameEvent.timestamp,
                    });
                    break;
                // case 'playerQuit':
                //     this.videoReplayService.addGameEvent({this: this, method: this.setToSolo, timestamp: gameEvent.timestamp});
                //     break;

                case 'endGame':
                    this.videoReplayService.addGameEvent({ this: this, method: this.endGame, timestamp: gameEvent.timestamp });
                    break;
            }
        });
    }

    private handleSocket() {
        this.socketService.addCallbackToMessage('startGame', (data) => {
            this.dataLightClient = data as string;
            this.playerService.setOpponentPlayer(data as string);
            this.enterGame();
        });
        this.socketService.addCallbackToMessage('success', (data) => {
            this.registerEvent({ this: this, method: this.handleSuccess, params: [data as string], timestamp: Date.now() });
            this.handleSuccess(data as string);
        });
        this.socketService.addCallbackToMessage('error', () => {
            this.registerEvent({ this: this, method: this.handleError, timestamp: Date.now() });
            this.handleError();
        });
        this.socketService.addCallbackToMessage('clock', (data) => {
            this.registerEvent({
                this: this.timeService,
                method: this.timeService.updateTime,
                params: [Math.round(data as number)],
                timestamp: Date.now(),
            });
            this.timeService.updateTime(Math.round(data as number));
        });
        this.socketService.addCallbackToMessage('winner', (data) => {
            this.registerEvent({ this: this, method: this.handleWinner, params: [JSON.parse(data as string) as Winner], timestamp: Date.now() });
            this.handleWinner(JSON.parse(data as string) as Winner);
        });
        this.socketService.addCallbackToMessage('cardChange', (data) => {
            const limitedTimeIO: LimitedTimeIO = JSON.parse(data as string) as LimitedTimeIO;
            this.registerEvent({
                this: this,
                method: this.handleCardChange,
                params: [limitedTimeIO],
                timestamp: Date.now(),
            });
            this.handleCardChange(limitedTimeIO);
        });
        this.socketService.addCallbackToMessage('endGame', (isWinner) => {
            this.registerEvent({
                this: this,
                params: [JSON.parse(isWinner as string) as boolean],
                method: this.handleEndGame,
                timestamp: Date.now(),
            });
            this.handleEndGame(JSON.parse(isWinner as string) as boolean);
        });
        this.socketService.addCallbackToMessage('playerQuit', () => {
            this.gameLimitedIsQuit = true;
        });
        this.socketService.addCallbackToMessage('constants', (constants) => {
            this.registerEvent({ this: this, method: this.updateConstants, params: [constants as string], timestamp: Date.now() });
            this.updateConstants(constants as string);
        });
        this.socketService.addCallbackToMessage('observerDifferences', (data) => {
            this.differenceFoundPositions = JSON.parse(data as string) as Coordinate[][];
        });

        this.socketService.addCallbackToMessage('observerInteraction', (dataReceived) => {
            const data = JSON.parse(dataReceived as string);
            this.viewService.setObserverInteraction(data.coords, data.senderId, data.isRightSide);
        });

        this.socketService.addCallbackToMessage('observerWatching', (data) => {
            const observerCount = JSON.parse(data as string);
            this.gameIsWatched = observerCount !== 0;
            this.observerCount = observerCount;
        });
        this.socketService.addCallbackToMessageAccountSocket('setRank', (data) => {
            const player = JSON.parse(data as string);
            let i = 0;
            this.playerService.opponentPlayers.forEach((players) => {
                if (players.pseudo === player.pseudo) this.playerService.opponentPlayers[i].rank = player.rank;
                i++;
            });
        });
        this.socketService.addCallbackToMessage('playersCount', (d) => {
            const data = JSON.parse(d as string) as any[];
            this.playerService.opponentPlayers.forEach((player) => {
                data.forEach((deta) => {
                    if(player.pseudo === deta.name) player.differenceCount = deta.foundDifferencesCount;
                })
            });
        });
    }
}
