/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AuthenticationComponent } from '@app/components/authentication/authentication.component';
import { AvatarComponent } from '@app/components/avatar/avatar.component';
import { MAX_LENGTH_FIELD, MIN_LENGTH_PASSWORD, PLACEHOLDER_EMAIL } from '@app/components/profile-creation/profile-creation.component.constants';
import { AvatarImage } from '@app/interfaces/avatar-image';
import { AccountService } from '@app/services/account/account.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
@Component({
    selector: 'app-profile-creation',
    templateUrl: './profile-creation.component.html',
    styleUrls: ['./profile-creation.component.scss'],
})
export class ProfileCreationComponent {
    @ViewChild('avatar') avatarComponent: AvatarComponent;
    protected placeholderEmail: string;
    protected pseudo: string;
    protected email: string;
    protected password: string;
    protected confirmPassword: string;
    protected readonly maxLengthField = MAX_LENGTH_FIELD;
    protected readonly minLengthPassword = MIN_LENGTH_PASSWORD;

    // eslint-disable-next-line max-params
    constructor(
        protected accountService: AccountService,
        private socketService: SocketClientService,
        private dialogRef: MatDialogRef<ProfileCreationComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            authenticationRef: MatDialogRef<AuthenticationComponent>;
        },
        public translateService: TranslateService,
        protected themeService: ThemeService,
    ) {
        this.placeholderEmail = PLACEHOLDER_EMAIL;
        this.pseudo = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
    }

    protected isValidPseudo(): boolean {
        return this.pseudo.length > 0 && this.pseudo.length <= MAX_LENGTH_FIELD;
    }

    protected isValidEmail(): boolean {
        return this.email.length <= MAX_LENGTH_FIELD;
    }

    protected isValidPassword(): boolean {
        return this.password.length >= MIN_LENGTH_PASSWORD && this.password.length <= MAX_LENGTH_FIELD;
    }

    protected isSamePassword(): boolean {
        return this.password === this.confirmPassword;
    }

    protected areFieldsValid(): boolean {
        return this.isValidPseudo() && this.isValidEmail() && this.isValidPassword() && this.isSamePassword();
    }

    protected async createAccount(): Promise<void> {
        if (this.areFieldsValid()) {
            const image = {
                imageId: this.avatarComponent.fileIsSet() ? 'custom' : 'base',
                imageData: this.avatarComponent.avatarFile,
            } as AvatarImage;
            const accountData = {
                email: this.email,
                pseudo: this.pseudo,
                password: this.password,
                avatarPicture: image as AvatarImage,
                socketId: this.socketService.accountSocketId, // socket id for game socket
                language: this.translateService.currentLanguage,
                theme: this.themeService.currentTheme,
            };
            const success = await this.accountService.createAccount(accountData);
            if (success) {
                this.closeLoginDialogs();
            }
        }
    }

    private closeLoginDialogs(): void {
        this.dialogRef.close();
        this.data.authenticationRef.close();
    }
}
