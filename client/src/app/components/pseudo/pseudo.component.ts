/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component } from '@angular/core';
import { MAX_LENGTH_PSEUDO } from '@app/components/authentication/authentication.component.constants';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AlertService } from '@app/services/alert/alert.service';

@Component({
    selector: 'app-pseudo',
    templateUrl: './pseudo.component.html',
    styleUrls: ['./pseudo.component.scss'],
})
export class PseudoComponent {
    protected newPseudo: string;
    // eslint-disable-next-line max-params
    constructor(
        protected accountService: AccountService,
        protected translateService: TranslateService,
        private dialogRef: MatDialogRef<PseudoComponent>,
        private alertService: AlertService,
    ) {
        this.newPseudo = '';
    }

    protected async sendPseudoChangeRequest(): Promise<void> {
        if (this.isValidPseudo()) {
            const success: boolean = await this.accountService.changePseudo(this.newPseudo);
            if (success) {
                this.dialogRef.close();
                this.alertService.generatePopUp('Pseudo changed', false);
            }
        }
    }

    protected isValidPseudo(): boolean {
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        return this.newPseudo.length >= 1 && this.newPseudo.length <= MAX_LENGTH_PSEUDO && alphanumericRegex.test(this.newPseudo);
    }
}
