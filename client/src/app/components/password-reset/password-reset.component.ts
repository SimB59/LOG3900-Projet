/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { MIN_LENGTH_PASSWORD } from '@app/components/profile-creation/profile-creation.component.constants';
import { MatLegacyDialogRef as MatDialogRef, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { AccountLoadingComponent } from '@app/components/account-loading/account-loading.component';

@Component({
    selector: 'app-password-reset',
    templateUrl: './password-reset.component.html',
    styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent {
    protected email: string;
    protected inputCode: string;
    protected generatedCode: string;
    protected newPassword: string;
    protected showCodeInput = false;
    protected readonly minLengthPassword = MIN_LENGTH_PASSWORD;

    // eslint-disable-next-line max-params
    constructor(
        protected accountService: AccountService,
        protected translateService: TranslateService,
        protected themeService: ThemeService,
        private dialogRef: MatDialogRef<PasswordResetComponent>,
        private dialog: MatDialog,
    ) {
        this.generatedCode = this.generateSixDigitCode();
        this.newPassword = '';
    }

    async sendPasswordChangeRequestEmail() {
        const loadingScreen = this.dialog.open(AccountLoadingComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
        if (await this.accountService.sendPasswordResetEmail(this.email, this.generatedCode)) {
            this.showCodeInput = true;
        }
        loadingScreen.close();
    }

    protected isValidEmail(): boolean {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(this.email);
    }

    protected generateSixDigitCode(): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    protected async changePasswordRequest(): Promise<void> {
        if (this.inputIsGeneratedCode() && this.isValidPassword()) {
            const success = await this.accountService.changePassword(this.email, this.newPassword);
            if (success) {
                this.dialogRef.close();
            }
        }
    }

    protected isValidPassword(): boolean {
        return this.newPassword.length >= MIN_LENGTH_PASSWORD;
    }

    protected inputIsGeneratedCode(): boolean {
        return this.inputCode === this.generatedCode;
    }
}
