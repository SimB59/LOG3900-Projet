/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { GameParameters } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { LobbyType, stringToLobbyType } from '@app/services/lobby/lobby.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-view-create-lobby',
    templateUrl: './view-create-lobby.component.html',
    styleUrls: ['./view-create-lobby.component.scss'],
})
export class ViewCreateLobbyComponent {
    // eslint-disable-next-line max-params
    constructor(
        protected translateService: TranslateService,
        protected lobbyService: LobbyService,
        protected cardSelectionChangeService: CardSelectionChangeService,
        private dialogRef: MatDialogRef<ViewCreateLobbyComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            parameters: GameParameters;
            index: number;
        },
    ) {}

    protected setLobbyType(lobbyTypeString: string) {
        const lobbyType: LobbyType = stringToLobbyType(lobbyTypeString);
        this.lobbyService.lobbyType = lobbyType;
        this.dialogRef.close();
        this.cardSelectionChangeService.loadGame(this.data.parameters, this.data.index);
    }
}
