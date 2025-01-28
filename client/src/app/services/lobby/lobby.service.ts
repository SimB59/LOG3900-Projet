/* eslint-disable */
import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '@app/interfaces/player';
import { AccountService } from '@app/services/account/account.service';
import { AlertService } from '@app/services/alert/alert.service';
import { FirstGameMode, SecondGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { LobbyIO } from '@common/lobby-io';
import { InputValidationService } from '../input-validation/input-validation.service';
import { DEFAULT_TIMES } from '../input-validation/input-validation.service.constants';
import { TranslateService } from '../translate/translate.service';
import { Lobby, LobbyType, Message, ObservableGame, ObserverGame } from './lobby.service.constants';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    playerQueue: LobbyIO[];
    playersObserver: string[];
    playerSelected: string;
    isInLobby: boolean;
    waitingRoomCards: string[];
    isGameCreator: boolean;
    playersLobby: Map<string, Map<string, Lobby>>;
    observerGames: Map<string, ObserverGame>;
    lobbyType: LobbyType = LobbyType.PUBLIC;
    public lastCardUsed: Card;
    public lastCardUsedId: string;
    private lobbyId: string;
    private isCallBackAlreadySet: boolean;

    constructor(private clientService: SocketClientService, protected translate: TranslateService, public gameService: GameService, public dialog: MatDialog, private accountService: AccountService, public alertService: AlertService, public router: Router, private inputValidationService: InputValidationService, private route: ActivatedRoute) {
        this.playerQueue = [];
        this.waitingRoomCards = [];
        this.isInLobby = false;
        this.isCallBackAlreadySet = false;
        this.isGameCreator = false;
        this.playersLobby = new Map();
        this.observerGames = new Map();
        this.playersObserver = [this.translate.getTranslation('All players')];
        this.playerSelected = this.playersObserver[0];
        this.lastCardUsedId = '';
    }

    setPlayers() {
        this.playersObserver = [this.translate.getTranslation('All players')];
        this.playerSelected = this.playersObserver[0];
        this.gameService.playerService.opponentPlayers.forEach((playerName: Player) => {
            this.playersObserver.push(playerName.pseudo);
        });
    }

    sendObserverInteraction(coord: Coordinate[], isRight: boolean) {
        let players: string[] = [];
        if (this.playerSelected === this.translate.getTranslation('All players')) players = this.playersObserver.slice(1);
        else players = [this.playerSelected];
        this.gameService.observerInteraction(coord, players, isRight);
    }

    handleSocket() {
        if (!this.isCallBackAlreadySet) {
            this.clientService.addCallbackToMessage('lobbyModification', (lobbyData) => { 
                this.playersLobby = this.convertBackToMap(lobbyData as string); 
                if( (this.lastCardUsed || this.route.snapshot.queryParams.cardId === FirstGameMode.LIMITED_TIME) && this.playersLobby.get(this.lastCardUsed.id)?.get(this.lobbyId)?.players[0] === this.accountService.pseudo) {
                    this.updateLobbyConstants();
                }
            });
            this.clientService.addCallbackToMessage('cardDeleted', (cardDelete) => this.handleCardDelete(cardDelete as string), false);
            this.clientService.addCallbackToMessage('joinRequestRejected', () => {
                this.dialog.closeAll();
                this.alertService.generatePopUp(Message.HostReject, false);
                this.isInLobby = false;
            });
            this.clientService.addCallbackToMessage('observerModification', (observerData) => this.handleObserverModification(observerData as string));
            this.clientService.addCallbackToMessage('createAborted', () => {
                this.handleHostCancelGame()
            });
            this.isCallBackAlreadySet = true;
        }
    }

    handleObserverModification(data: string) {
        // ObservableGame is the interface coming from server
        // ObserverGame is the interface for client
        const observerMap = JSON.parse(data) as ObservableGame[];
        this.observerGames = new Map();
        observerMap.forEach((item) => {
            this.observerGames.set(item.gameRoomName, {cardId: item.cardId, playerCount: item.playerCount, observerCount: item.observerCount, players: item.players});
        });
    }

    async joinObserverGame(roomName: string, cardId: string, players: string[]) {
        this.clientService.send('addObserver', roomName);
        const mode = roomName.includes(FirstGameMode.CLASSIC) ? FirstGameMode.CLASSIC : FirstGameMode.LIMITED_TIME;
        await this.gameService.enterGameAsObserver(cardId, mode, players);
        this.router.navigate(['/game'], { queryParams: { observer: 'true'}});
    }

    leaveObserverGame() {
        this.clientService.send('observerQuit');
    }

    updateLobbyConstants(){
        this.gameService.gameConstants = this.inputValidationService.constants;
        this.clientService.send(
            'updateLobbyConstants',
            JSON.stringify({ initial: this.inputValidationService.constants.initial, gain:this.inputValidationService.constants.gain,
                penalty: this.inputValidationService.constants.penalty,
                  isCheatMode: this.inputValidationService.constants.isCheatMode,
                 lobbyId: this.getLobbyId(), cardId: this.lastCardUsed.id}),
        );
    }

    resetValues(): void {
        this.inputValidationService.constants = { initial: DEFAULT_TIMES.initial, penalty: DEFAULT_TIMES.penalty, gain: DEFAULT_TIMES.gain , isCheatMode: false};
        this.inputValidationService.initialInputIsInvalid = false;
        this.inputValidationService.penaltyInputIsInvalid = false;
        this.inputValidationService.gainInputIsInvalid = false;
        this.inputValidationService.setConstants();
        this.updateLobbyConstants();
    }


    acceptPlayer(playerIndex: number) {
        // this.playerQueue[playerIndex].playerId = this.clientService.socketId;
        // this.playerQueue[playerIndex].playerName = this.gameService.selfName;
        this.clientService.send('joinRequestAccepted', JSON.stringify(this.playerQueue[playerIndex]));
        // TODO : modify here
        // const opponentName: string | undefined = this.playerQueue[playerIndex].secondPlayerName;
        // if (opponentName) 
        // this.gameService.initializeOpponent(opponentName);
        // this.gameService.enterGame(this.gameService.selfName, this.gameService.opponentName);
        // this.dialog.closeAll();
        this.isInLobby = false;
        this.handleGameDiscard(this.playerQueue[playerIndex].cardId);
        // this.playerQueue = [];
    }

    enterLobby() {
        this.setLobbyId(`${this.gameService.gameData.firstMode}_${this.accountService.pseudo}_${Date.now()}_${this.gameService.gameData.id}`);
        // console.log(this.lobbyType);
        const data = JSON.stringify({
                cardId: this.gameService.gameData.id,
                firstMode: this.gameService.gameData.firstMode,
                secondMode: SecondGameMode.VERSUS,
                playerName: this.accountService.pseudo,
                lobbyId: this.getLobbyId(),
                lobbyType: this.lobbyType,
            } as LobbyIO);
            this.lastCardUsedId = this.gameService.gameData.id;
            this.isInLobby = true;
        this.clientService.send('createWaitingRoom', data);
        //Plus besoin selon Antoine. -- Sidney
        // this.lobbyId = this.gameService.gameData.id;
    }

    joinLobby(cardId: string, lobbyId: string): string {
        let firstMode =  FirstGameMode.CLASSIC;
        if(cardId === FirstGameMode.LIMITED_TIME){
            firstMode = FirstGameMode.LIMITED_TIME;
        }
        const data = JSON.stringify({
            cardId: cardId,
            firstMode: firstMode,
            secondMode: SecondGameMode.VERSUS,
            playerName: this.accountService.pseudo,
            lobbyId: lobbyId
        } as LobbyIO);
        this.lastCardUsedId = cardId;
        this.clientService.send('addPlayer', data);
        this.isInLobby = true;
        return lobbyId;
    }

    abandonWaitingRoom(lobbyId: string, cardId: string) {
        this.clientService.send(
            'joinRequestAborted',
            JSON.stringify({
                cardId: cardId,
                playerName: this.accountService.pseudo,
                playerId: this.clientService.socketId,
                lobbyId: lobbyId,
            } as LobbyIO),
        );
        this.isInLobby = false;
    }

    deleteCard(cardId: string) {
        this.clientService.send('cardDeleted', cardId);
    }

    getLobbyId(): string {
        return this.lobbyId;
    }
    setLobbyId(lobbyId: string) {
        this.lobbyId = lobbyId;
    }

    private handleHostCancelGame() {
        /* if(this.lastCardUsed){

            if(!this.playersLobby.get(this.lastCardUsed.id)?.get(this.getLobbyId()) && this.isInLobby){ */
                this.dialog.closeAll();
                this.alertService.generatePopUp('Host left', true);
                this.router.navigate(['/home']);
                this.isInLobby = false;
          //  }
       // }
    }

    /* private handleAccept(data: LobbyIO) {
        if (this.clientService.socketId === data.secondPlayerId) {
            if (data.firstPlayerName) this.gameService.initializeOpponent(data.firstPlayerName);
            this.gameService.enterGame(this.gameService.selfName, this.gameService.opponentName);
            this.dialog.closeAll();
            this.isInLobby = false;
        }
        this.handleGameDiscard(data.cardId);
    } */

    private handleGameDiscard(cardId: string) {
        this.waitingRoomCards.splice(this.waitingRoomCards.indexOf(cardId, 0), 1);
        if (this.isInLobby && cardId === this.lobbyId) {
            this.dialog.closeAll();
            this.isInLobby = false;
            this.alertService.generatePopUp(Message.HostChoseOther, false);
        }
    }

    private handleCardDelete(cardId: string) {
        this.waitingRoomCards.splice(this.waitingRoomCards.indexOf(cardId), 1);
        if (this.isInLobby && cardId === this.lastCardUsedId) {
            this.dialog.closeAll();
            this.isInLobby = false;
            this.alertService.generatePopUp(Message.CardDeleted, true);
            this.router.navigate(['/home']);
        }
    }

    private convertBackToMap(data: string) {
        const waitingRoomsObject = JSON.parse(data);
        const waitingRooms = new Map<string, Map<string, Lobby>>();

        Object.entries(waitingRoomsObject).forEach(([key, innerObject]: [string, any]) => {
            const innerMap = new Map<string, Lobby>();
            Object.entries(innerObject as { [key: string]: Lobby }).forEach(([innerKey, lobby]: [string, Lobby]) => {
                innerMap.set(innerKey, lobby);
            });
            waitingRooms.set(key, innerMap);
        });

        return waitingRooms;
    }
}
