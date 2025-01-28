/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PopupMessageComponent } from '@app/components/popup-message/popup-message.component';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    constructor(protected dialog: MatDialog, protected themeService: ThemeService) {}

    generatePopUp(message: string, isTypeError: boolean): void {
        this.dialog.open(PopupMessageComponent, {
            data: { message, isTypeError },
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }
}
