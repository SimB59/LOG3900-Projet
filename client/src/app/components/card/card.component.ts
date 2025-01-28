/* eslint-disable */
import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ViewMode } from '@app/components/selection-area/selection-area.component.constants';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Card } from '@common/card';
import { environment } from 'src/environments/environment';


@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit, OnChanges {
    @Input() card: Card;
    @Input() viewMode!: ViewMode;
    @Input() index: number;
    @Output() playEvent;
    @Output() multiplayerEvent;
    imageSource: string;
    lobbiesIDs: [string];
    protected isConfigMode: boolean;
    protected isInLobby: boolean;
    protected gameMode: FirstGameMode;

    // eslint-disable-next-line max-params
    constructor(
        protected cardChangeService: CardSelectionChangeService,
        protected gameService: GameService,
        protected lobbyService: LobbyService,
        protected translationService: TranslateService,
        protected themeService: ThemeService,
        protected dialog: MatDialog,
        private location: Location,
    ) {
        this.imageSource = '';
        this.playEvent = new EventEmitter();
        this.multiplayerEvent = new EventEmitter();
    }

    get cardId() {
        return this.card.id;
    }

    async ngOnInit(): Promise<void> {
        this.isConfigMode = this.viewMode === ViewMode.CONFIGURATION;
        // peut-être devoir changer
        this.isInLobby = this.viewMode === ViewMode.LOBBY;
        this.gameMode = this.location.path() === '/options/classic' ? FirstGameMode.CLASSIC : FirstGameMode.LIMITED_TIME;
    }

    ngOnChanges() {
        this.imageSource = `${environment.serverUrlApi}/image/${this.card.id + '_original'}`;
    }

    isLookingForGame() {
        return this.location.path() === '/options/classic';
    }

    protected isMultiplayerState() {
        // console.log('changing last card used');
        this.lobbyService.lastCardUsed = this.card;
        this.gameService.gameData.firstMode = this.gameMode;
        return this.lobbyService.waitingRoomCards.includes(this.cardId);
    }
}
