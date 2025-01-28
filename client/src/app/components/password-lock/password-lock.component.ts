/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { AlertService } from '@app/services/alert/alert.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-password-lock',
    templateUrl: './password-lock.component.html',
    styleUrls: ['./password-lock.component.scss'],
})
export class PasswordLockComponent {
    protected password: string;
    private readonly adminPassword: string = 'admin';

    // eslint-disable-next-line max-params
    constructor(
        protected translateService: TranslateService,
        protected alertService: AlertService,
        private router: Router,
        private dialogRef: MatDialogRef<PasswordLockComponent>,
    ) {
        this.password = '';
    }

    protected submit(): void {
        if (!this.isPasswordEmpty()) {
            if (this.isPasswordCorrect()) {
                this.router.navigate(['/config']);
                this.dialogRef.close();
            } else {
                this.alertService.generatePopUp('Wrong password', true);
                this.password = '';
            }
        }
    }

    protected isPasswordEmpty(): boolean {
        return this.password === '';
    }

    private isPasswordCorrect(): boolean {
        return this.password === this.adminPassword;
    }
}
