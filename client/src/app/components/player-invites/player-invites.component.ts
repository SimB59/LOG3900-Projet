/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Friend } from '@common/friend';
import { BlockPlayerComponent } from '@app/components/block-player/block-player.component';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';

@Component({
    selector: 'app-player-invites',
    templateUrl: './player-invites.component.html',
    styleUrls: ['./player-invites.component.scss'],
})
export class PlayerInvitesComponent {
    // eslint-disable-next-line max-params
    constructor(
        protected accountService: AccountService,
        protected translateService: TranslateService,
        protected themeService: ThemeService,
        protected dialog: MatDialog,
    ) {}

    protected openBlockDialog(player: Friend): void {
        this.dialog.open(BlockPlayerComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
            data: { player },
        });
    }
}
