/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { Component, Input, OnChanges } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DeleteAllCardsConfirmationComponent } from '@app/components/delete-all-cards-confirmation/delete-all-cards-confirmation.component';
import { HistoryComponent } from '@app/components/history/history.component';
import { ResetAllStatsConfirmationComponent } from '@app/components/reset-all-stats-confirmation/reset-all-stats-confirmation.component';
import { ViewCreateLobbyComponent } from '@app/components/view-create-lobby/view-create-lobby.component';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { HistoryService } from '@app/services/history/history.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';
import { Card } from '@common/card';
import { ViewMode } from './selection-area.component.constants';

@Component({
    selector: 'app-selection-area',
    templateUrl: './selection-area.component.html',
    styleUrls: ['./selection-area.component.scss'],
})
export class SelectionAreaComponent implements OnChanges {
    @Input() viewMode!: ViewMode;
    @Input() cardDataArray: Card[];
    isConfigMode: boolean;
    protected imagePaths: string[];

    // We need all of these parameters, so we disable the max-params rule.
    // eslint-disable-next-line max-params
    constructor(
        protected cardChangeService: CardSelectionChangeService,
        protected lobbyService: LobbyService,
        protected historyService: HistoryService,
        protected themeService: ThemeService,
        public dialog: MatDialog,
        protected translateService: TranslateService,
    ) {
        this.isConfigMode = false;
        this.imagePaths = new Array();
        this.lobbyService.handleSocket();
    }

    ngOnChanges() {
        this.isConfigMode = this.viewMode === ViewMode.CONFIGURATION;
    }

    protected openMatchHistory() {
        this.dialog.open(HistoryComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected openResetAllStatsConfirmation() {
        this.dialog.open(ResetAllStatsConfirmationComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected openDeleteAllCardsConfirmation() {
        this.dialog.open(DeleteAllCardsConfirmationComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected openCreateLobbyDialog(index: number): void {
        this.dialog.open(ViewCreateLobbyComponent, {
            data: { parameters: { isSolo: false, isClassic: true }, index },
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }
}
