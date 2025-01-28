import { Component, OnInit } from '@angular/core';
/* eslint-disable */
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AuthenticationComponent } from '@app/components/authentication/authentication.component';
import { PasswordLockComponent } from '@app/components/password-lock/password-lock.component';
import { AccountService } from '@app/services/account/account.service';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';



@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public translateService: TranslateService,
        private cardChangeService: CardSelectionChangeService,
        private lobbyService: LobbyService,
        private accountService: AccountService,
        protected themeService: ThemeService,
    ) {
        if (!this.aUserIsConnected()) {
            this.dialog.open(AuthenticationComponent, {
                disableClose: true,
                panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
            });
        }
    }

    async ngOnInit() {
        this.lobbyService.handleSocket();
        await this.cardChangeService.fetchCards();
        await this.cardChangeService.fetchActiveCards();
        await this.accountService.fetchAccountData();
    }

    protected async disconnect(): Promise<void> {
        const success = await this.accountService.disconnectAccount();
        if (success) {
            this.dialog.open(AuthenticationComponent, {
                disableClose: true,
                panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
            });
        }
    }

    protected aUserIsConnected(): boolean {
        return this.accountService.aUserIsConnected();
    }

    protected promptPasswordLock(): void {
        this.dialog.open(PasswordLockComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }
}
