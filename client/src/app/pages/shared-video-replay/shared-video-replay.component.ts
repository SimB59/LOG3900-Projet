import { Component, ViewChild } from '@angular/core';
import { MatRadioGroup } from '@angular/material/radio';
import { AccountService } from '@app/services/account/account.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';

@Component({
    selector: 'app-shared-video-replay',
    templateUrl: './shared-video-replay.component.html',
    styleUrls: ['./shared-video-replay.component.scss'],
})
export class SharedVideoReplayComponent {
    @ViewChild('ownedRadio') ownedRadio: MatRadioGroup;
    @ViewChild('publicRadio') publicRadio: MatRadioGroup;
    selectedValuePublic: string = '1';
    selectedValueOwned: string = '1';

    protected isDisplayingOwnedVideoReplays: boolean = true;
    // eslint-disable-next-line max-params
    constructor(
        protected videoReplayService: VideoReplayService,
        private accountService: AccountService,
        protected translateService: TranslateService,
        protected themeService: ThemeService,
    ) {
        this.videoReplayService.handleSocket();
        // Je pourrais juste chercher les private et après public si je click dessus
        this.videoReplayService.getVideoReplay(this.accountService.accountId, this.accountService.pseudo);
    }

    isOwningVideoReplay(): boolean {
        if (this.videoReplayService.getOwnedVideoReplays()) return this.videoReplayService.getOwnedVideoReplays().length > 0;
        else return false;
    }

    isPublicVideoReplay(): boolean {
        if (this.videoReplayService.getPublicVideoReplays()) return this.videoReplayService.getPublicVideoReplays().length > 0;
        else return false;
    }

    filterVideoReplays(filter: string, isPublic: boolean) {
        let typeofFilter = 1;
        if (isPublic) typeofFilter = +this.selectedValuePublic;
        else typeofFilter = +this.selectedValueOwned;

        if (typeofFilter === 1) this.videoReplayService.filterVideoReplaysByCardName(filter, isPublic);
        else this.videoReplayService.filterVideoReplaysByPseudo(filter, isPublic);
    }

    openTab(tab: string, event: Event) {
        event.stopPropagation();
        if (tab === 'owned') {
            this.isDisplayingOwnedVideoReplays = true;
            // Je pourrais changer cela et juste chercher ce que j'ai besoin
            this.videoReplayService.getVideoReplay(this.accountService.accountId, this.accountService.pseudo);
        } else {
            this.isDisplayingOwnedVideoReplays = false;
            this.videoReplayService.getVideoReplay(this.accountService.accountId, this.accountService.pseudo);
        }
    }
}
