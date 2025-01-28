/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { AvatarComponent } from '@app/components/avatar/avatar.component';
import { PseudoComponent } from '@app/components/pseudo/pseudo.component';
import { AccountService } from '@app/services/account/account.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent {
    @ViewChild('avatarComponent') avatarComponent: AvatarComponent;
    // eslint-disable-next-line max-params
    constructor(
        protected accountService: AccountService,
        private router: Router,
        protected translateService: TranslateService,
        public dialog: MatDialog,
        protected themeService: ThemeService,
    ) {}

    protected async disconnect(): Promise<void> {
        const success = await this.accountService.disconnectAccount();
        if (success) {
            // Redirect to the main page
            this.router.navigate(['/home']);
        }
    }

    protected aUserIsConnected(): boolean {
        return this.accountService.aUserIsConnected();
    }

    protected openPseudoChange() {
        this.dialog.open(PseudoComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected openAvatarChange(fileChangeEvent: Event) {
        const target = fileChangeEvent.target as HTMLInputElement;
        if (target && target.files && target.files.length) {
            this.avatarComponent.saveNewAvatar(target.files[0]);
        }
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
