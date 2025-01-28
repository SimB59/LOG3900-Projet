/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component, Input } from '@angular/core';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-observer-interaction',
    templateUrl: './observer-interaction.component.html',
    styleUrls: ['./observer-interaction.component.scss'],
})
export class ObserverInteractionComponent {
    @Input() isOn: boolean;
    selectedValue: string = this.translate.getTranslation('All players');

    constructor(protected lobbyService: LobbyService, protected translate: TranslateService) {
        this.lobbyService.setPlayers();
    }

    onSelectionChange(event: Event) {
        const selectedValue = (event.target as HTMLSelectElement).value;
        this.lobbyService.playerSelected = selectedValue;
    }
}
