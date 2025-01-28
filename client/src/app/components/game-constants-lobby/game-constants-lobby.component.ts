/* eslint-disable */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/services/account/account.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { InputValidationService } from '@app/services/input-validation/input-validation.service';
import { DEFAULT_TIMES } from '@app/services/input-validation/input-validation.service.constants';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { GAIN_MAX_VALUE, GAIN_MIN_VALUE, INITIAL_MAX_VALUE, INITIAL_MIN_VALUE, PENALTY_MAX_VALUE, PENALTY_MIN_VALUE } from '@common/game-constants';
@Component({
    selector: 'app-game-constants-lobby',
    templateUrl: './game-constants-lobby.component.html',
    styleUrls: ['./game-constants-lobby.component.scss'],
})
export class GameConstantsLobbyComponent {
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
        protected translationService: TranslateService,
        protected themeService: ThemeService,
        public gameService: GameService,
        public lobbyService: LobbyService,
        private accountService: AccountService,
        private route: ActivatedRoute,
    ) {
        this.defaultValuesMessage = `${translationService.getTranslation('defaultValuesMessage 1/3')} ${
            DEFAULT_TIMES.initial
        }, ${translationService.getTranslation('defaultValuesMessage 2/3')} ${DEFAULT_TIMES.penalty} ${translationService.getTranslation(
            'defaultValuesMessage 3/3',
        )} ${DEFAULT_TIMES.gain})`;

        this.initialErrorMessage = `${translationService.getTranslation('Value between')} ${INITIAL_MIN_VALUE} ${translationService.getTranslation(
            'and',
        )} ${INITIAL_MAX_VALUE} ${translationService.getTranslation('seconds required')}`;

        this.penaltyErrorMessage = `${translationService.getTranslation('Value between')} ${PENALTY_MIN_VALUE} ${translationService.getTranslation(
            'and',
        )} ${PENALTY_MAX_VALUE} ${translationService.getTranslation('seconds required')}`;

        this.gainErrorMessage = `${translationService.getTranslation('Value between')} ${GAIN_MIN_VALUE} ${translationService.getTranslation(
            'and',
        )} ${GAIN_MAX_VALUE} ${translationService.getTranslation('seconds required')}`;
    }
    ngOnInit(): void {
        if(!this.isJoining()){
            this.resetValues();
        }
    }

    // eslint-disable-next-line
    ngAfterViewInit(): void {
        this.inputValidationService.handleSocket();
    }

    isLimitedTime() {
        return this.gameService.gameData.firstMode === FirstGameMode.LIMITED_TIME;
    }

    resetValues(): void {
        this.inputValidationService.constants = {
            initial: DEFAULT_TIMES.initial,
            penalty: DEFAULT_TIMES.penalty,
            gain: DEFAULT_TIMES.gain,
            isCheatMode: false,
        };
        this.inputValidationService.initialInputIsInvalid = false;
        this.inputValidationService.penaltyInputIsInvalid = false;
        this.inputValidationService.gainInputIsInvalid = false;
        this.inputValidationService.setConstants();
        this.lobbyService.updateLobbyConstants();
    }

    isJoining(): boolean {
        if (this.route.snapshot.queryParams.cardId !== FirstGameMode.LIMITED_TIME) {
            // classic lobby
            const data = this.lobbyService.playersLobby.get(this.lobbyService.lastCardUsed.id);
                if(data) {
                    let lobby = data.get(this.lobbyService.getLobbyId());
                    if(lobby) {
                        const creatorPseudo = lobby!.players![0];
                        return this.accountService.pseudo !== creatorPseudo;
                    }
                }
                return false;
        } else {
            let creatorPseudo;
            //limited time lobby
            if(this.lobbyService.playersLobby) {
                const data = this.lobbyService.playersLobby.get(FirstGameMode.LIMITED_TIME);
                if(data) {
                    const lobby = data.get(this.lobbyService.getLobbyId());
                    if(lobby && lobby.players[0]) creatorPseudo = lobby!.players![0];
                }
            }
            return this.accountService.pseudo !== creatorPseudo;
        }
    }
}
