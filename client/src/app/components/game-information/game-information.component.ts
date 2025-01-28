import { Component, Input } from '@angular/core';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-game-information',
    templateUrl: './game-information.component.html',
    styleUrls: ['./game-information.component.scss'],
})
export class GameInformationComponent {
    @Input() gameTitle: string;
    @Input() differenceAmount: number;
    @Input() gameMode: string;
    @Input() penaltyValue: number;
    @Input() gainValue: number;
    constructor(protected translateService: TranslateService) {}
}
