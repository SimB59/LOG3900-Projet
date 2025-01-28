/* eslint-disable */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameConstantsLobbyComponent } from '@app/components/game-constants-lobby/game-constants-lobby.component';
import { ViewMode } from '@app/components/selection-area/selection-area.component.constants';
import { AccountService } from '@app/services/account/account.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { InputValidationService } from '@app/services/input-validation/input-validation.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Card } from '@common/card';
import { GameConstants } from '@common/game-constants';

@Component({
    selector: 'app-lobby-waiting-room',
    templateUrl: './lobby-waiting-room.component.html',
    styleUrls: ['./lobby-waiting-room.component.scss'],
})
export class LobbyWaitingRoomComponent {
    @ViewChild('gameConstants') gameConstantsComponent: GameConstantsLobbyComponent;
    card: Card;
    viewModeLobby: ViewMode;
    errorMessage: string;
    isChatboxHidden = false;
    showHideButton = true;

    // eslint-disable-next-line max-params
    constructor(
        protected themeService: ThemeService,
        protected translationService: TranslateService,
        protected lobbyService: LobbyService,
        private socketClientService: SocketClientService,
        private gameService: GameService,
        protected inputValidationService: InputValidationService,
        private route: ActivatedRoute,
        protected accountService: AccountService,
    ) {
        this.translationService = translationService;
        this.lobbyService = lobbyService;
        this.viewModeLobby = ViewMode.LOBBY;
        this.card = this.lobbyService.lastCardUsed;
        this.errorMessage = '';
    }
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit() {
        if (this.route.snapshot.queryParams.cardId === 'Limited'){
            this.card = { id: this.route.snapshot.queryParams.cardId } as Card;
            this.lobbyService.lastCardUsed = this.card;
            this.lobbyService.lastCardUsedId = this.card.id;
        } 
            
        else this.card = this.lobbyService.lastCardUsed;
    }

    ngOnChange() {
        this.isDisable();
    }

    toggleChatboxVisibility() {
        this.isChatboxHidden = !this.isChatboxHidden;
    }

    isChatDetach(isAttached: boolean) {
        this.showHideButton = isAttached;
    }

    isDisable() {
        try{

           if( this.showErrorMessage()) return true;
            //eslint-disable-next-line
            return this.lobbyService.playersLobby.get(this.card.id)!.get(this.lobbyService.getLobbyId())!.players.length < 2 
        }catch(e){
            return true;
        }
    }

    showErrorMessage(): boolean{

        if(this.inputValidationService.constantsAreInvalid()){
            this.errorMessage = this.translationService.getTranslation('constantsAreInvalid');
            return true;
        }

        if(this.inputValidationService.constantsAreDifferentFromPrevious()){
            this.errorMessage = this.translationService.getTranslation('constantsAreDifferentFromPrevious');
            return true;
        }

        return false;
    }

    leave() {
        this.lobbyService.abandonWaitingRoom(this.lobbyService.getLobbyId(), this.card.id);
    }

    startGame() {
        let penalty = '5'
        let gain = '5';

        if(this.gameConstantsComponent.penaltyRef){
            penalty = this.gameConstantsComponent.penaltyRef.nativeElement.value;
        }

        if(this.gameConstantsComponent.gainRef){
            gain = this.gameConstantsComponent.gainRef.nativeElement.value;
        }

        this.socketClientService.send(
            'startGame',
            JSON.stringify({
                lobbyId: this.lobbyService.getLobbyId(),
                cardId: this.card.id,
                firstMode: this.gameService.gameData.firstMode,
                constants: { isCheatMode: this.inputValidationService.constants.isCheatMode,
                     initial: +this.gameConstantsComponent.initialRef.nativeElement.value,
                      penalty: +penalty,
                       gain: +gain,
                    } as GameConstants,
            }),
        );
    }

    isJoining(): boolean{
        if(this.route.snapshot.queryParams.cardId !== FirstGameMode.LIMITED_TIME){
            //classic lobby
            if(this.lobbyService.playersLobby) {
                const data = this.lobbyService.playersLobby.get(this.lobbyService.lastCardUsed.id);
                if(data) {
                    let lobby = data.get(this.lobbyService.getLobbyId());
                    if(lobby) {
                        const creatorPseudo = lobby!.players![0];
                        return this.accountService.pseudo !== creatorPseudo;
                    }
                }
            }

            return false;

        }else{
            let creatorPseudo;
            //limited time lobby
            if(this.lobbyService.playersLobby) {
                const data = this.lobbyService.playersLobby.get(FirstGameMode.LIMITED_TIME);
                if(data) {
                    const lobby = data.get(this.lobbyService.getLobbyId());
                    if(lobby && lobby.players[0]) creatorPseudo = lobby!.players![0];
                }
            }
            return this.accountService.pseudo !== creatorPseudo;
        }

     }
}
