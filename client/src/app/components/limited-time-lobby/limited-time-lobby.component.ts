import { Component, Input } from '@angular/core';
import { LIMITED } from '@app/components/limited-time-lobby/limited-time-lobby.component.constants';
import { MAX_PLAYERS } from '@app/components/view-lobby-players/view-lobby-players.component.constants';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-limited-time-lobby',
    templateUrl: './limited-time-lobby.component.html',
    styleUrls: ['./limited-time-lobby.component.scss'],
})
export class LimitedTimeLobbyComponent {
    @Input() playersLobbyPseudo: string[];
    @Input() lobbyId: string;
    /* eslint-disable-next-line */
    constructor(
        protected translationService: TranslateService,
        protected themeService: ThemeService,
        private lobbyService: LobbyService,
        private gameService: GameService,
        private cardChangeService: CardSelectionChangeService,
    ) {}

    isFull() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-magic-numbers
        return this.lobbyService.playersLobby.get(LIMITED)!.get(this.lobbyId)!.players.length >= MAX_PLAYERS;
    }

    joinGame() {
        this.lobbyService.setLobbyId(this.lobbyId);
        this.lobbyService.joinLobby(FirstGameMode.LIMITED_TIME, this.lobbyId);
        this.gameService.gameData.firstMode = FirstGameMode.LIMITED_TIME;
        // loadGame redirect to lobby
        this.cardChangeService.loadGame({ isSolo: false, isClassic: false }, 0, false);
    }
}
