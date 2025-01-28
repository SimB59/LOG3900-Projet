import { Component, ElementRef, ViewChild } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { InputValidationService } from '@app/services/input-validation/input-validation.service';
import { DEFAULT_TIMES } from '@app/services/input-validation/input-validation.service.constants';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { GAIN_MAX_VALUE, GAIN_MIN_VALUE, INITIAL_MAX_VALUE, INITIAL_MIN_VALUE, PENALTY_MAX_VALUE, PENALTY_MIN_VALUE } from '@common/game-constants';
@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent {
    @ViewChild('initial') initialRef: ElementRef<HTMLInputElement>;
    @ViewChild('penalty') penaltyRef: ElementRef<HTMLInputElement>;
    @ViewChild('gain') gainRef: ElementRef<HTMLInputElement>;
    defaultValuesMessage: string;

    initialMinValue = INITIAL_MIN_VALUE;
    initialDefaultValue = DEFAULT_TIMES.initial;
    initialMaxValue = INITIAL_MAX_VALUE;
    initialErrorMessage: string;

    penaltyMinValue = PENALTY_MIN_VALUE;
    penaltyDefaultValue = DEFAULT_TIMES.penalty;
    penaltyMaxValue = PENALTY_MAX_VALUE;
    penaltyErrorMessage: string;

    gainMinValue = GAIN_MIN_VALUE;
    gainDefaultValue = DEFAULT_TIMES.gain;
    gainMaxValue = GAIN_MAX_VALUE;
    gainErrorMessage: string;

    // eslint-disable-next-line max-params
    constructor(
        protected inputValidationService: InputValidationService,
        protected accountService: AccountService,
        protected lobbyService: LobbyService,
        protected translateService: TranslateService,
    ) {
        // defaultValuesMessage has to have this format to be able to use the interpolation and display properly
        this.defaultValuesMessage = `${translateService.getTranslation('defaultValuesMessage 1/3')} ${
            DEFAULT_TIMES.initial
        }, ${translateService.getTranslation('defaultValuesMessage 2/3')} ${DEFAULT_TIMES.penalty} ${translateService.getTranslation(
            'defaultValuesMessage 3/3',
        )} ${DEFAULT_TIMES.gain})`;

        this.initialErrorMessage = `${translateService.getTranslation('Value between')} ${INITIAL_MIN_VALUE} ${translateService.getTranslation(
            'and',
        )} ${INITIAL_MAX_VALUE} ${translateService.getTranslation('seconds required')}`;

        this.penaltyErrorMessage = `${translateService.getTranslation('Value between')} ${PENALTY_MIN_VALUE} ${translateService.getTranslation(
            'and',
        )} ${PENALTY_MAX_VALUE} ${translateService.getTranslation('seconds required')}`;

        this.gainErrorMessage = `${translateService.getTranslation('Value between')} ${GAIN_MIN_VALUE} ${translateService.getTranslation(
            'and',
        )} ${GAIN_MAX_VALUE} ${translateService.getTranslation('seconds required')}`;
    }
}
