/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PASSWORD, PLACEHOLDER_PSEUDO } from '@app/components/authentication/authentication.component.constants';
import { ProfileCreationComponent } from '@app/components/profile-creation/profile-creation.component';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { PasswordResetComponent } from '@app/components/password-reset/password-reset.component';
import { ThemeService } from '@app/services/theme/theme.service';
import { DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';

@Component({
    selector: 'app-authentication',
    templateUrl: './authentication.component.html',
    styleUrls: ['./authentication.component.scss'],
})
export class AuthenticationComponent {
    protected placeholderPseudo: string;
    protected pseudo: string;
    protected password: string;
    protected readonly maxLengthPseudo = MAX_LENGTH_PSEUDO;
    protected readonly minLengthPassword = MIN_LENGTH_PASSWORD;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        protected accountService: AccountService,
        private dialogRef: MatDialogRef<AuthenticationComponent>,
        protected translateService: TranslateService,
        protected themeService: ThemeService,
    ) {
        this.pseudo = '';
        this.placeholderPseudo = PLACEHOLDER_PSEUDO;
        this.password = '';
    }

    protected isValidPseudo(): boolean {
        return this.pseudo.length <= MAX_LENGTH_PSEUDO;
    }

    protected isValidPassword(): boolean {
        return this.password.length >= MIN_LENGTH_PASSWORD;
    }

    protected areFieldsValid(): boolean {
        return this.isValidPseudo() && this.isValidPassword();
    }

    protected openCreateAccountDialog(): void {
        this.dialog.open(ProfileCreationComponent, {
            disableClose: true,
            data: { authenticationRef: this.dialogRef },
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected openPasswordChange() {
        this.dialog.open(PasswordResetComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected async loginUser(): Promise<void> {
        if (this.areFieldsValid()) {
            const success = this.accountService.loginAccount(this.pseudo, this.password);
            if (await success) {
                this.dialogRef.close();
            } else {
                this.password = '';
            }
        }
    }
}
