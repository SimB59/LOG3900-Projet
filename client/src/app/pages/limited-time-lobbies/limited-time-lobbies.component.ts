import { Component } from '@angular/core';
// eslint-disable-next-line import/no-deprecated
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ViewCreateLobbyComponent } from '@app/components/view-create-lobby/view-create-lobby.component';
import { AccountService } from '@app/services/account/account.service';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { Lobby, LobbyType } from '@app/services/lobby/lobby.service.constants';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-limited-time-lobbies',
    templateUrl: './limited-time-lobbies.component.html',
    styleUrls: ['./limited-time-lobbies.component.scss'],
})
export class LimitedTimeLobbiesComponent {
    /*eslint-disable*/

    // eslint-disable-next-line max-params
    constructor(
        protected themeService: ThemeService,
        protected translationService: TranslateService,
        protected lobbyService: LobbyService,
        protected accountService: AccountService,
        protected dialog: MatDialog,
        protected cardChangeService: CardSelectionChangeService,
        protected gameService: GameService,
    ) {}
    getPlayersLobby(): Map<string, Lobby> {
        return this.lobbyService.playersLobby.get(FirstGameMode.LIMITED_TIME) as Map<string, Lobby>;
    }

    openCreateLobbyDialog(): void {
        this.dialog.open(ViewCreateLobbyComponent, {
            data: { parameters: { isSolo: false, isClassic: false }, index: 0 },
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    getRange(): number[] {
        const joinableLobbies: Map<string, Lobby> = this.getJoinableLobbies('Limited', FirstGameMode.LIMITED_TIME);
        return Array(joinableLobbies.size || 0)
            .fill(0)
            .map((x, i) => i);
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
