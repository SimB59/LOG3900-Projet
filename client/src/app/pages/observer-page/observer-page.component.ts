import { Component } from '@angular/core';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ObserverGame } from '@app/services/lobby/lobby.service.constants';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-observer-page',
    templateUrl: './observer-page.component.html',
    styleUrls: ['./observer-page.component.scss'],
})
export class ObserverPageComponent {
    constructor(public themeService: ThemeService, public lobbyService: LobbyService, protected translationService: TranslateService) {
        this.lobbyService.handleSocket();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapToArray(map: Map<string, ObserverGame>): any[][] {
        return Array.from(map.entries());
    }
}
