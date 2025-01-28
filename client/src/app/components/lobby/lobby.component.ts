/* eslint-disable */
import { Component, Input } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ViewLobbyPlayersComponent } from '@app/components/view-lobby-players/view-lobby-players.component';
import { AccountService } from '@app/services/account/account.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { Lobby, LobbyType } from '@app/services/lobby/lobby.service.constants';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';
import { Card } from '@common/card';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
    @Input() card: Card;
    @Input() index: number;
    @Input() gameMode: FirstGameMode;
    constructor(
        protected lobbyService: LobbyService,
        public dialog: MatDialog,
        public translateService: TranslateService,
        protected themeService: ThemeService,
        public accountService: AccountService,
    ) {}

    async openPlayersLobbyWidget(lobbyNumber: number) {
        // This code gets the real lobby number

        let count = -1;
        let lobbyId = '';
        for (const [key] of this.lobbyService.playersLobby.get(this.card.id)!) {
            count++;
            if (count === Number(lobbyNumber)) {
                lobbyId = key;
                break;
            }
        }
        this.openJoinLobbyDialog(lobbyId);
    }

    getRange(): number[] {
        const joinableLobbies: Map<string, Lobby> = this.getJoinableLobbies(this.card.id, this.gameMode);
        return Array(joinableLobbies.size || 0)
            .fill(0)
            .map((x, i) => i);
    }

    protected openJoinLobbyDialog(lobbyId: string): void {
        this.dialog.open(ViewLobbyPlayersComponent, {
            data: {
                players: this.lobbyService.playersLobby.get(this.card.id)?.get(lobbyId)?.players,
                card: this.card,
                lobbyNumber: lobbyId,
                gameMode: this.gameMode,
                index: this.index,
            },
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    private getJoinableLobbies(cardId: string, firstGameMode: FirstGameMode): Map<string, Lobby> {
        const joinableLobbies: Map<string, Lobby> = new Map();
        if ((!this.isLobbiesEmptyExceptForLimited() || firstGameMode === FirstGameMode.LIMITED_TIME) && this.lobbyService.playersLobby.has(cardId)) {
            this.lobbyService.playersLobby.get(cardId)?.forEach((lobby, lobbyId) => {
                // 1. Validate firstGameMode (classic vs reflex)
                const lobbyIdElements: string[] = lobbyId.split('_');
                const firstGameModeString: string = lobbyIdElements[0];
                const currentGameModeString: string = firstGameMode;
                if (firstGameModeString === currentGameModeString) {
                    // 2. Check if Friends only
                    if (
                        lobby.lobbyType === LobbyType.FRIENDS &&
                        this.accountService.friendsList.some((friend) => friend.pseudo === lobby.players[0])
                    ) {
                        joinableLobbies.set(lobbyId, lobby);
                    }
                    // 3. Check if Friends of friends
                    else if (lobby.lobbyType === LobbyType.FRIENDS_OF_FRIENDS && this.accountService.friendsPseudoOfFriends.includes(lobby.players[0])) {
                        joinableLobbies.set(lobbyId, lobby);
                    }
                    // 4. Public: check if blocked
                    else if (lobby.lobbyType === LobbyType.PUBLIC) {
                        let isLobbyAvailable = true;
                        for (const player of lobby.players) {
                            if (this.accountService.blockedList.some((blockedBy) => blockedBy.pseudo === player)) {
                                isLobbyAvailable = false;
                            }
                        }
                        if (isLobbyAvailable) {
                            joinableLobbies.set(lobbyId, lobby);
                        }
                    }
                }
                
            });
        }
        return joinableLobbies;
    }

    private isLobbiesEmptyExceptForLimited() {
        if (Object.keys(this.lobbyService.playersLobby).length === 0) {
            return false;
        }
        return Object.keys(this.lobbyService.playersLobby).length === 1 && this.lobbyService.playersLobby.has('Limited');
    }
}
