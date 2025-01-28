/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AccountService } from '@app/services/account/account.service';
import { AlertService } from '@app/services/alert/alert.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Friend } from '@common/friend';

@Component({
    selector: 'app-block-player',
    templateUrl: './block-player.component.html',
    styleUrls: ['./block-player.component.scss'],
})
export class BlockPlayerComponent {
    // eslint-disable-next-line max-params
    constructor(
        protected translateService: TranslateService,
        protected accountService: AccountService,
        @Inject(MAT_DIALOG_DATA) public data: { player: Friend },
        protected alertService: AlertService,
    ) {}

    protected blockConfirmation(): void {
        this.alertService.generatePopUp('Player blocked successfully', false);
    }

    protected blockPlayer(): void {
        this.accountService.blockPlayer(this.data.player);
        this.blockConfirmation();
    }
}
