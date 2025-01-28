import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    constructor(public timeService: TimerService, protected gameService: GameService, protected translationService: TranslateService) {}
}
