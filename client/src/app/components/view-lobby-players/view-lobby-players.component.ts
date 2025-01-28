/* eslint-disable */
import { Component, Inject } from '@angular/core';
// eslint-disable-next-line import/no-deprecated
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { MAX_PLAYERS } from '@app/components/view-lobby-players/view-lobby-players.component.constants';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Card } from '@common/card';

@Component({
    selector: 'app-view-lobby-players',
    templateUrl: './view-lobby-players.component.html',
    styleUrls: ['./view-lobby-players.component.scss'],
})
export class ViewLobbyPlayersComponent {
    // eslint-disable-next-line max-params
    constructor(
        protected lobbyService: LobbyService,
        protected translateService: TranslateService,
        private gameService: GameService,
        // eslint-disable-next-line deprecation/deprecation, import/no-deprecated
        private dialogRef: MatDialogRef<ViewLobbyPlayersComponent>,
        private router: Router,
        private cardChangeService: CardSelectionChangeService,
        // eslint-disable-next-line deprecation/deprecation, import/no-deprecated
        @Inject(MAT_DIALOG_DATA)
        public data: {
            players: string[];
            card: Card;
            lobbyNumber: string;
            gameMode: FirstGameMode;
            index: number;
        },
    ) {}

    joinGame() {
        this.lobbyService.setLobbyId(this.data.lobbyNumber);
        this.lobbyService.joinLobby(this.data.card.id, this.data.lobbyNumber);
        this.gameService.gameData.firstMode = this.data.gameMode;
        // set card
        this.lobbyService.lastCardUsed = this.data.card;
        this.lobbyService.lastCardUsedId = this.data.card.id;
        this.dialogRef.close();
        this.cardChangeService.loadGame({ isSolo: false, isClassic: true }, this.data.index, false);
        this.router.navigate(['/lobby']);
    }

    ngOnChanges() {
        if(!this.lobbyService.playersLobby.get(this.data.card.id)?.get(this.data.lobbyNumber)) {
            this.dialogRef.close();
        }
    }

    isFull() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-magic-numbers
        return this.lobbyService.playersLobby.get(this.data.card.id)!.get(this.data.lobbyNumber)!.players.length >= MAX_PLAYERS;
    }
}
