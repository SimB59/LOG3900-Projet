/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component, OnDestroy } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { AbandonConfirmationComponent } from '@app/components/abandon-confirmation/abandon-confirmation.component';
// eslint-disable-next-line import/namespace
import { EndGameComponent } from '@app/components/end-game/end-game.component';
import { AccountService } from '@app/services/account/account.service';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { PlayerService } from '@app/services/player/player.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { Subscription } from 'rxjs';
// eslint-disable-next-line import/namespace
import { TranslateService } from '@app/services/translate/translate.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';
import { EASTER_EGG_CODE } from './game-page.component.constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    isChatboxHidden = false;
    showHideButton = true;
    protected easterEggCode: string;
    private endSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        protected lobbyService: LobbyService,
        protected gameService: GameService,
        private dialog: MatDialog,
        protected accountService: AccountService,
        protected playerService: PlayerService,
        protected themeService: ThemeService,
        protected router: ActivatedRoute,
        protected translateService: TranslateService,
        private videoReplayService: VideoReplayService,
    ) {
        this.endSubscription = this.gameService.endPopUpSubject.subscribe(() => {
            if (this.gameService.getEndPopUpVisibility())
                this.dialog.open(EndGameComponent, {
                    data: { isObserverMode: this.isObserverMode() },
                    disableClose: true,
                    panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
                });
        });
        this.easterEggCode = EASTER_EGG_CODE;
    }

    ngOnDestroy(): void {
        this.endSubscription.unsubscribe();
    }

    isObserverMode() {
        return this.router.snapshot.queryParams['observer'] === 'true';
    }

    toggleChatboxVisibility() {
        this.isChatboxHidden = !this.isChatboxHidden;
    }

    isChatDetach(isAttached: boolean) {
        this.showHideButton = isAttached;
    }

    protected openAbandonConfirmation(): void {
        if (this.isObserverMode()) this.lobbyService.leaveObserverGame();
        this.dialog.open(AbandonConfirmationComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected stop(): void {
        this.videoReplayService.stop();
        this.videoReplayService.isPlayingSavedVideo = false;
        this.gameService.videoGameControlsAreVisible = false;
        this.gameService.resetGame();
        this.gameService.navigate('/home');
    }

    protected findAccountRankName(rank: number): string {
        const rankValue: number = Math.floor(rank / 2);
        switch (rankValue) {
            case 0:
                return 'Bronze';
            case 1:
                return 'Silver';
            case 2:
                return 'Gold';
            default:
                return 'Platinum';
        }
    }
}
