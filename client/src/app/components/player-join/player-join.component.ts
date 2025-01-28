import { Component, Input } from '@angular/core';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-player-join',
    templateUrl: './player-join.component.html',
    styleUrls: ['./player-join.component.scss'],
})
export class PlayerJoinComponent {
    @Input() numberOfJoin: number;

    constructor(protected lobbyService: LobbyService, protected translateService: TranslateService, protected themeService: ThemeService) {}
}
