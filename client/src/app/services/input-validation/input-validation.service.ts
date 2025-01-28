/* eslint-disable */
import { ElementRef, Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import {
    GAIN_MAX_VALUE,
    GAIN_MIN_VALUE,
    GameConstants,
    INITIAL_MAX_VALUE,
    INITIAL_MIN_VALUE,
    PENALTY_MAX_VALUE,
    PENALTY_MIN_VALUE,
} from '@common/game-constants';
import { Message } from '@common/message';
import { firstValueFrom } from 'rxjs';
import { GameService } from '../game/game.service';
import { DEFAULT_TIMES, DISABLED, ENABLED } from './input-validation.service.constants';

@Injectable({
    providedIn: 'root',
})
export class InputValidationService {
    constants: GameConstants;
    public previousConstants: GameConstants;
    public initialInputIsInvalid: boolean;
    public penaltyInputIsInvalid: boolean;
    public gainInputIsInvalid: boolean;

    constructor(
        private socketService: SocketClientService,
        private communicationService: CommunicationService,
        private gameService: GameService,
    ) {
        this.constants = { initial: DEFAULT_TIMES.initial, penalty: DEFAULT_TIMES.penalty, gain: DEFAULT_TIMES.gain, isCheatMode: false };
        this.handleSocket();
        this.fetchConstants();
        this.copyConstants();
    }

    getCheatModeMessage(): string {
        if (this.constants.isCheatMode) {
            return ENABLED;
        }else{
            return DISABLED;
        }    
    }

    removeAllFirstZeroes(elemRef: HTMLInputElement): void {
        while (elemRef.value.startsWith('0') && elemRef.value.length > 1) {
            elemRef.value = elemRef.value.substring(1);
        }
    }

    validateKeyPress(event: KeyboardEvent): boolean {
        return event.key >= '0' && event.key <= '9';
    }

    verifyInitial(elemRef: ElementRef<HTMLInputElement>): void {
        this.removeAllFirstZeroes(elemRef.nativeElement);
        this.initialInputIsInvalid =
            Number(elemRef.nativeElement.value) < INITIAL_MIN_VALUE || Number(elemRef.nativeElement.value) > INITIAL_MAX_VALUE;
    }

    verifyPenalty(elemRef: ElementRef<HTMLInputElement>): void {
        this.removeAllFirstZeroes(elemRef.nativeElement);
        this.penaltyInputIsInvalid =
            Number(elemRef.nativeElement.value) < PENALTY_MIN_VALUE || Number(elemRef.nativeElement.value) > PENALTY_MAX_VALUE;
    }

    verifyGain(elemRef: ElementRef<HTMLInputElement>): void {
        this.removeAllFirstZeroes(elemRef.nativeElement);
        this.gainInputIsInvalid = Number(elemRef.nativeElement.value) < GAIN_MIN_VALUE || Number(elemRef.nativeElement.value) > GAIN_MAX_VALUE;
    }

    constantsAreInvalid(): boolean {
        return this.initialInputIsInvalid || this.penaltyInputIsInvalid || this.gainInputIsInvalid;
    }

    constantsAreDifferentFromPrevious(): boolean {
        return (
            this.previousConstants.gain !== this.constants.gain ||
            this.previousConstants.initial !== this.constants.initial ||
            this.previousConstants.penalty !== this.constants.penalty ||
            this.previousConstants.isCheatMode !== this.constants.isCheatMode
        );
    }

    async setConstants() {
        if (this.constantsAreDifferentFromPrevious() && !this.constantsAreInvalid()) {
            await firstValueFrom(
                this.communicationService.postRequest('card/constants', { title: 'constants', body: JSON.stringify(this.constants) } as Message),
            );
            this.copyConstants();
        }
    }

    handleSocket() {
        this.socketService.addCallbackToMessage(
            'constantsChanged',
            (constants) => {
                this.constants = JSON.parse(constants as string) as GameConstants;
                this.copyConstants();
            }   
        );

        this.socketService.addCallbackToMessage(
            'updateLobbyConstants',
            (timeConstants) => {    
                const data = JSON.parse(timeConstants as string);
                this.constants.initial = data.initial;
                this.constants.isCheatMode = data.isCheatMode;
                this.constants.penalty = data.penalty;
                this.constants.gain = data.gain;
                this.gameService.gameConstants = this.constants;
                this.copyConstants();
            }
        );
    }

    private async fetchConstants() {
        this.constants = JSON.parse((await firstValueFrom(this.communicationService.getRequest('card/constants'))).body);
        this.copyConstants();
    }

    private copyConstants(): void {
        this.previousConstants = { ...this.constants };
    }
}
