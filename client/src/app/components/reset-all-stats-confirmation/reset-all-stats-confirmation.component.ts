import { Component } from '@angular/core';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-reset-all-stats-confirmation',
    templateUrl: './reset-all-stats-confirmation.component.html',
    styleUrls: ['./reset-all-stats-confirmation.component.scss'],
})
export class ResetAllStatsConfirmationComponent {
    constructor(protected cardChangeService: CardSelectionChangeService, protected translateService: TranslateService) {}
}
