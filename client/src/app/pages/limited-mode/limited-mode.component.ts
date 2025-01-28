/* eslint-disable import/no-deprecated */
import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ViewCreateLobbyComponent } from '@app/components/view-create-lobby/view-create-lobby.component';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';
import { Card } from '@common/card';

@Component({
    selector: 'app-limited-mode',
    templateUrl: './limited-mode.component.html',
    styleUrls: ['./limited-mode.component.scss'],
})
/*eslint-disable*/
export class LimitedModeComponent implements OnInit {
    card: Card;
    constructor(
        protected cardChangeService: CardSelectionChangeService,
        private lobbyService: LobbyService,
        protected gameService: GameService,
        public translateService: TranslateService,
        protected themeService: ThemeService,
        protected dialog: MatDialog,

    ) {
        this.card = {id: "Limited"} as Card;
    }

    async ngOnInit() {
        this.lobbyService.handleSocket();
    }

    protected isMultiplayerState() {
        return this.lobbyService.waitingRoomCards.includes(FirstGameMode.LIMITED_TIME);
    }

    protected openCreateLobbyDialog(): void {
        this.dialog.open(ViewCreateLobbyComponent, {
            data: { parameters: { isSolo: false, isClassic: false }, index: 0 },
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }
}
