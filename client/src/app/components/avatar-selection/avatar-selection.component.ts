/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-avatar-selection',
    templateUrl: './avatar-selection.component.html',
    styleUrls: ['./avatar-selection.component.scss'],
})
export class AvatarSelectionComponent {
    protected avatarOptions: string[] = [
        'assets/images/avatar-options/user-female-skin-type-1-and-2.png',
        'assets/images/avatar-options/user-female-skin-type-3.png',
        'assets/images/avatar-options/user-female-skin-type-4.png',
        'assets/images/avatar-options/user-female-skin-type-6.png',
        'assets/images/avatar-options/user-male-skin-type-1-and-2.png',
        'assets/images/avatar-options/user-male-skin-type-3.png',
        'assets/images/avatar-options/user-male-skin-type-4.png',
        'assets/images/avatar-options/user-male-skin-type-6.png',
    ];

    constructor(
        protected accountService: AccountService,
        protected translationService: TranslateService,
        public dialogRef: MatDialogRef<AvatarSelectionComponent>,
    ) {}

    protected selectAvatar(avatarUrl: string): void {
        this.dialogRef.close(avatarUrl);
    }
}
