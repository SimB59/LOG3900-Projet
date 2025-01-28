/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-popup-message',
    templateUrl: './popup-message.component.html',
    styleUrls: ['./popup-message.component.scss'],
})
export class PopupMessageComponent {
    constructor(public translateService: TranslateService, @Inject(MAT_DIALOG_DATA) public data: { message: string; isTypeError: boolean }) {}
}
