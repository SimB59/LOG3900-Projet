/* eslint-disable max-lines */
/* eslint-disable */
import { VideoReplay } from '@app/model/database/video-replay';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { ClassicGameService } from '@app/services/classic-game/classic-game.service';
import { DatabaseService } from '@app/services/database/database.service';
import { GameMode } from '@app/services/game/game.service.constants';
import { LimitedTimeGameService } from '@app/services/limited-time-game/limited-time-game.service';
import { ReflexGameService } from '@app/services/reflex-game/reflex-game.service';
import { ChatEntry } from '@common/chatbox-message';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { LobbyIO } from '@common/lobby-io';
import { Winner } from '@common/winner';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { FirstGameMode, LIMITED, Lobby, ObservableGame, ObserverInteractionInfo, Player, stringToLobbyType } from './game-manager.service.constants';

@Injectable()
export class GameManagerService {
    private playingRooms: Map<string, string>;
    private observerRooms: Map<string, string>;
    private waitingRooms: Map<string, Map<string, Lobby>>;
    private games: GameMode[];
    private connectedSockets: Map<string, Socket>;
    private classicRoomCounter: number;
    private serverSocket: Server;
    private gameConstants: Map<string, GameConstants>;

    // eslint-disable-next-line max-params
    constructor(
        private databaseService: DatabaseService,
        private readonly cardService: CardService,
    ) {
        this.playingRooms = new Map();
        this.observerRooms = new Map();
        this.waitingRooms = new Map();
        this.games = new Array();
        this.connectedSockets = new Map();
        this.classicRoomCounter = 0;
        this.waitingRooms.set(LIMITED, new Map<string, Lobby>());
        this.gameConstants = new Map();
    }

    set server(socket: Server) {
        this.serverSocket = socket;
    }

    async checkLimitedMode() {
        const cards = await this.cardService.getAllActiveCards();
        if (cards.length === 0) {
            let lobbies = new Map<string, Lobby>();
            this.waitingRooms.set(LIMITED, lobbies);
        }
        this.updateCardStatus(JSON.stringify(this.getMapInArrayForm()), 'lobbyModification');
    }

    handleInteraction(dataReceived: string) {
        // data has to be {coord: Coordinate[], playerTarget: string[], roomName: string, sender: string, isRightSide: boolean}
        const data = JSON.parse(dataReceived);
        const roomName = this.observerRooms.get(data.sender);
        this.playingRooms.forEach((value: string, key: string) => {
            if (value === roomName) {
                const socket = this.getSocketFromId(key);
                if (socket) {
                    const game = this.getGame(this.getSocketFromId(key));
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    if (game && data.playerTarget.indexOf(game.getPlayerData(socket).name) !== -1) {
                        const observerInteractionInfo: ObserverInteractionInfo = { coords: data.coords, senderId: data.sender, isRightSide: data.isRightSide };
                        game.getPlayerData(socket).socket.emit(
                            'observerInteraction',
                            JSON.stringify(observerInteractionInfo),
                        );
                    }
                }
            }
        });
    }

    async handleDisconnect(playerSocket: Socket) {
        const game = this.getGame(playerSocket);
        const data = this.getSocketFromId(playerSocket.id).data as LobbyIO;
        data.playerId = playerSocket.id;
        this.handleAbortedRequest(JSON.stringify(data));
        if (game && !game.isGameEnded()) {
            await this.surrenderGame(playerSocket, game);
        }
        this.connectedSockets.delete(playerSocket.id);
    }

    async handleConnection(playerSocket: Socket): Promise<void> {
        this.connectedSockets.set(playerSocket.id, playerSocket);
        const waitingRoomsString = JSON.stringify(this.getMapInArrayForm());
        playerSocket.emit('lobbyModification', waitingRoomsString);
        this.sendObserverJoinableGames();
        const cards = await this.cardService.getAllCards();
        this.cardService.updateClientLimitedModeEnable(cards.length);
    }

    sendObserverJoinableGames() {
        const observableGames: ObservableGame[] = [];
        if (this.playingRooms) {
            this.playingRooms.forEach((roomName: string, socketId: string) => {
                const existingGameIndex = observableGames.findIndex((game) => game.gameRoomName === roomName);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (existingGameIndex !== -1) {
                    observableGames[existingGameIndex].playerCount++;
                } else {
                    const game = this.getGame(this.getSocketFromId(socketId));
                    if (game) {
                        const data = game.getPlayerData(this.getSocketFromId(socketId));
                        const playersArr = [];
                        game.players.forEach((element) => {
                            playersArr.push(element.name);
                        });
                        observableGames.push({
                            gameRoomName: roomName,
                            cardId: data.cardId.includes(FirstGameMode.LIMITED_TIME) ? FirstGameMode.LIMITED_TIME + playersArr[0] : data.cardId,
                            players: playersArr,
                            playerCount: 1,
                            observerCount: 0,
                        });
                    }
                }
            });

            this.observerRooms.forEach((roomName: string) => {
                const existingGameIndex = observableGames.findIndex((game) => game.gameRoomName === roomName);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (existingGameIndex !== -1) {
                    observableGames[existingGameIndex].observerCount++;
                }
            });
            this.broadcast('observerModification', JSON.stringify(observableGames));
        }
    }

    joinObserverGame(roomName: string, socket: Socket) {
        this.observerRooms.set(socket.id, roomName);
        this.sendObserverJoinableGames();
        socket.join(roomName);
        let socketId = '';
        this.playingRooms.forEach((value: string, key: string) => {
            if (value === roomName) socketId = key;
        });
        const game = this.getGame(this.getSocketFromId(socketId));
        if (roomName.includes(FirstGameMode.CLASSIC) || roomName.includes(FirstGameMode.REFLEX)) socket.emit('observerDifferences', JSON.stringify(game.differencesFound));
        else {
            game.initCards(true);
            socket.emit('cardChange', JSON.stringify(game.currentGame()));
            socket.emit('constants', JSON.stringify(this.gameConstants.get(roomName)));
        }
        const playerArr = [];
        game.players.forEach((player) => {
            playerArr.push({name: player.name, foundDifferencesCount: player.foundDifferencesCount});
        });
        socket.emit('playersCount', JSON.stringify(playerArr));
        let observerCount = 0;
        // eslint-disable-next-line no-unused-vars
        this.observerRooms.forEach((value: string, key: string) => {
            if (value === roomName) observerCount++;
        });
        this.sendTo(roomName, 'observerWatching', JSON.stringify(observerCount)); // Notify players that game is being watched
    }

    removeObserverGame(socket: Socket) {
        const roomName = this.observerRooms.get(socket.id);
        socket.leave(roomName);
        this.observerRooms.delete(socket.id);
        let observerCount = 0;
        // eslint-disable-next-line no-unused-vars
        this.observerRooms.forEach((value: string, key: string) => {
            if (value === roomName) observerCount++;
        });
        this.sendTo(roomName, 'observerWatching', JSON.stringify(observerCount)); // Notify players that game is being watched
        this.sendObserverJoinableGames();
    }

    handleMessageEvent(socket: Socket, socketData: string) {
        const date = new Date();
        const formattedTime = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric',  timeZone: 'America/Montreal'  });
        const tempSocketData = JSON.parse(socketData as unknown as string) as ChatEntry;
        tempSocketData.timestamp = formattedTime;
        let room = this.playingRooms.get(socket.id);
        if (!room) room = this.observerRooms.get(socket.id);
        let playersInLobby = [];
        if (!room) {
            this.waitingRooms.forEach((lobbyMap) => {
                lobbyMap.forEach((lobby) => {
                    lobby.players.forEach((player) => {
                        if (player.socketId === socket.id) {
                            playersInLobby = lobby.players;
                        }
                    });
                });
            });
            playersInLobby.forEach((player) => {
                this.getSocketFromId(player.socketId).emit('message', JSON.stringify(tempSocketData));
            });
        } else {
            this.sendTo(room, 'message', JSON.stringify(tempSocketData));
        }
    }

    handleUpdateLobbyConstants(socketData: string) {
        const data = JSON.parse(socketData);
        const cardId = data.cardId;
        const lobbyId = data.lobbyId;
        if (this.waitingRooms.has(cardId) && this.waitingRooms.get(cardId).has(lobbyId)) {
            const initialTime = data.initial;
            // Laisser ce code commenté au cas où -- 03-13-2024 Sidney
            const isCheatMode = data.isCheatMode;
            // this.sendTo(lobbyId, 'updateLobbyConstants', JSON.stringify({ initial: time, isCheatMode }));
            // Laisser ce code commenté au cas où -- 03-13-2024 Sidney
            if (!data.penalty) {
                data.penalty = 5;
            }

            if (!data.gain) {
                data.gain = 5;
            }
            this.waitingRooms
                .get(cardId)
                .get(lobbyId)
                .players.forEach((player) => {
                    this.getSocketFromId(player.socketId).emit(
                        'updateLobbyConstants',
                        JSON.stringify({ initial: initialTime, gain: data.gain, penalty: data.penalty, isCheatMode }),
                    );
                });
        }

        return data;
    }

    async addPlayer(playerSocket: Socket, socketData: string): Promise<void> {
        playerSocket.data = JSON.parse(socketData) as LobbyIO;
        this.join(playerSocket);
    }

    handleSurrender(playerSocket: Socket): void {
        const game = this.getGame(playerSocket);
        if (game) this.surrenderGame(playerSocket, game);
    }

    async handleClick(playerSocket: Socket, clickData: string): Promise<void> {
        const coord = JSON.parse(clickData) as Coordinate;
        const game = this.getGame(playerSocket);
        const room = this.playingRooms.get(playerSocket.id);
        if (game && room && coord) {
            const gameEnded = await game.handleClick(room, coord, playerSocket);
            if (gameEnded) {
                this.games.splice(this.games.indexOf(game), 1);
                this.playingRooms.delete(playerSocket.id);
                this.observerRooms.forEach((value, key) => {
                    if (value === room) {
                        this.observerRooms.delete(key);
                    }
                });
            }
        }
    }

    handleAbortedRequest(socketData: string) {
        const data = JSON.parse(socketData) as LobbyIO;
        const lobbyMap = this.waitingRooms.get(data.cardId);
        this.observerRooms.delete(data.playerId);
        if (lobbyMap) {
            this.getLobbyId(data.cardId, data.playerName, data.playerId).forEach((lobbyId) => {
                const lobby = lobbyMap.get(lobbyId);
                if (lobby) {
                    let index = 0;
                    for (let i = 0; i < lobby.players.length; i++) {
                        if (lobby.players[i].pseudo === data.playerName) {
                            index = i;
                        }
                    }
                    if (index === 0) {
                        // eslint-disable-next-line @typescript-eslint/prefer-for-of
                        for (let i = 0; i < lobby.players.length; i++) {
                            const socket = this.getSocketFromId(lobby.players[i].socketId);
                            if (i !== index) socket.emit('createAborted');
                            socket.rooms.forEach((room) => {
                                socket.leave(room);
                            });
                        }
                        lobbyMap.delete(lobbyId);
                        this.waitingRooms.set(data.cardId, lobbyMap);
                        const waitingRoomsString = this.getMapInArrayForm();
                        this.updateCardStatus(JSON.stringify(waitingRoomsString), 'lobbyModification');
                    } else {
                        const socket = this.getSocketFromId(lobby.players[index].socketId);
                        socket.rooms.forEach((room) => {
                            socket.leave(room);
                        });
                        lobby.players.splice(index, 1);
                        lobbyMap.set(lobbyId, lobby);
                        this.waitingRooms.set(data.cardId, lobbyMap);
                        const waitingRoomsString = this.getMapInArrayForm();
                        this.updateCardStatus(JSON.stringify(waitingRoomsString), 'lobbyModification');
                    }
                }
            });
        }
    }

    createWaitingRoom(firstPlayer: Socket, socketData: string): void {
        const data = JSON.parse(socketData) as LobbyIO;
        firstPlayer.join(data.lobbyId);
        firstPlayer.data.playerId = firstPlayer.id;
        firstPlayer.data = data;
        const lobbies = this.waitingRooms.get(data.cardId);
        if (lobbies) {
            lobbies.set(data.lobbyId, {
                players: [{ pseudo: firstPlayer.data.playerName, socketId: firstPlayer.id }],
                lobbyType: stringToLobbyType(data.lobbyType),
            });
            this.waitingRooms.set(data.cardId, lobbies);
        } else {
            this.waitingRooms.set(
                data.cardId,
                new Map<string, Lobby>([
                    [
                        data.lobbyId,
                        {
                            players: [{ pseudo: firstPlayer.data.playerName, socketId: firstPlayer.id }],
                            lobbyType: stringToLobbyType(data.lobbyType),
                        },
                    ],
                ]),
            );
        }
        const waitingRoomsString = this.getMapInArrayForm();
        this.updateCardStatus(JSON.stringify(waitingRoomsString), 'lobbyModification');
    }

    getWaitingRoom(cardId: string, lobbyId: string): Lobby {
        const cardLobby = this.waitingRooms.get(cardId);
        return cardLobby.get(lobbyId);
    }

    endGame(socket: Socket) {
        const game = this.getGame(socket);
        const room = this.playingRooms.get(socket.id);
        this.games.splice(this.games.indexOf(game), 1);
        this.playingRooms.delete(socket.id);
        this.observerRooms.forEach((value, key) => {
            if (value === room) {
                this.observerRooms.delete(key);
            }
        });
        this.sendObserverJoinableGames();
    }

    // eslint-disable-next-line max-params
    async startGame(lobbyId: string, cardId: string, gameType: FirstGameMode, constants: GameConstants): Promise<void> {
        const players = this.waitingRooms.get(cardId).get(lobbyId).players;
        this.waitingRooms.get(cardId).delete(lobbyId);
        this.updateCardStatus(JSON.stringify(this.getMapInArrayForm()), 'lobbyModification');
        const game = await this.createNewGameService(players, cardId, gameType, constants);
        this.games.push(game);
        const room = this.playingRooms.get(players[0].socketId);
        // await this.games[this.games.length - 1].initCards();
        await game.startTimer(room);
        await game.start();
        this.sendTo(room, 'startGame', JSON.stringify(players));
        this.sendObserverJoinableGames();
    }

    handleSaveReplay(gameEvents: string) {
        // ne reçoit pas les functions de gameEvents
        // console.log('Game events received: ', gameEvents);
        this.databaseService.createVideoReplay(JSON.parse(gameEvents) as VideoReplay);
    }

    private join(player: Socket): void {
        player.join(player.data.lobbyId);
        player.data.playerId = player.id;
        this.setWaitingRoom(player.data.cardId, player, player.data.lobbyId);
        this.updateCardStatus(JSON.stringify(this.getMapInArrayForm()), 'lobbyModification');
    }

    private setWaitingRoom(cardId: string, waitingPlayer: Socket, lobbyId: string = ''): void {
        if (waitingPlayer) {
            const lobbiesArray = this.waitingRooms.get(cardId);
            if (lobbiesArray) {
                const lobby = lobbiesArray.get(lobbyId);
                if (lobby) {
                    if (lobby.players.length <= 3) {
                        // max 4 players guard
                        lobby.players.push({ pseudo: waitingPlayer.data.playerName, socketId: waitingPlayer.id });
                        lobbiesArray.set(lobbyId, { players: lobby.players, lobbyType: lobby.lobbyType });
                        this.waitingRooms.set(cardId, lobbiesArray);
                    }
                }
            }
        }
    }

    private getGame(socket: Socket): GameMode {
        if (this.games) {
            return this.games.find((game) => {
                if (game.players) {
                    return game.players.find((player) => {
                        if (player.socket && player.socket.id && socket && socket.id) {
                            return player.socket.id === socket.id;
                        }
                    });
                }
            });
        }
    }

    private updateCardStatus(infos: string, status: string) {
        this.broadcast(status, infos);
    }

    private getSocketFromId(socketId: string): Socket {
        return this.connectedSockets.get(socketId);
    }

    private hasCreatedWaitingRoom(playerSocketId: string): boolean {
        const playerIsWaiting = playerSocketId === '';
        /* this.waitingRooms.forEach((player: Socket) => {
            if (player.id === playerSocketId) playerIsWaiting = true;
        }); */
        return playerIsWaiting;
    }

    private sendTo(receiver: string, message: string, args?: string): void {
        if (args) {
            this.serverSocket.to(receiver).emit(message, args);
        } else {
            this.serverSocket.to(receiver).emit(message);
        }
    }

    private broadcast(message: string, data: string): void {
        this.serverSocket.emit(message, data);
    }

    // Note: Trivial Method approved by Kamel on 03/14/2023 to prevent the constructor stub problem in tests
    // eslint-disable-next-line max-params
    private async createNewGameService(players: Player[], cardId: string, gameType: FirstGameMode, constants: GameConstants): Promise<GameMode> {
        const playersArray: PlayerData[] = new Array();
        const gameConstants = await this.cardService.getGameConstants(); // TODO à retirer plus besoin --Sidney
        gameConstants.initial = constants.initial;
        gameConstants.isCheatMode = constants.isCheatMode;
        gameConstants.penalty = constants.penalty;
        gameConstants.gain = constants.gain;
        const room = gameType + String(this.classicRoomCounter++);
        this.gameConstants.set(room, gameConstants);
        players.forEach((player) => {
            const playerSocket = this.getSocketFromId(player.socketId);
            playerSocket.rooms.forEach((roomName) => {
                playerSocket.leave(roomName);
            });
            playerSocket.join(room);
            this.playingRooms.set(playerSocket.id, room);
            playersArray.push({
                name: player.pseudo,
                foundDifferencesCount: 0,
                socket: playerSocket,
                timerValue: 0,
                cardId,
                differencesFound: null,
                differencesFoundIndices: null,
            });
        });
        switch (gameType) {
            case FirstGameMode.CLASSIC:
                return new ClassicGameService(this.serverSocket, this.databaseService, this.cardService, playersArray, gameConstants);
            case FirstGameMode.REFLEX:
                return new ReflexGameService(this.serverSocket, this.databaseService, this.cardService, playersArray, gameConstants);
            default:
                return new LimitedTimeGameService(this.serverSocket, this.cardService, playersArray, gameConstants, this.databaseService);
        }
    }

    private async surrenderGame(playerSocket: Socket, game: GameMode) {
        const room = this.playingRooms.get(playerSocket.id);
        // const playerData = game.getPlayerData(playerSocket);
        const isClassical = game instanceof ClassicGameService;
        game.removePlayer(playerSocket);
        this.playingRooms.delete(playerSocket.id);
        playerSocket.leave(room);
        if (!game.isStillPlaying()) {
            // WARNING : Only works for classical mode as of now
            // TODO: verify everything works with history
            try{
                if (game.players[0].socket) playerSocket.to(room).emit('winner', JSON.stringify({ socketId: game.players[0].socket.id } as Winner));
                if(game.players[0].socket && !isClassical) playerSocket.to(room).emit('playerQuit');

            }catch(e){
                
            }
            game.stopTimer();
            if (game.players[0]) {
                const newGameHistory = await game.addHistory(game.players[0].socket.id);
                this.games.splice(this.games.indexOf(game), 1);
                this.observerRooms.forEach((value, key) => {
                    if (value === room) {
                        this.observerRooms.delete(key);
                    }
                });
                this.serverSocket.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
            }
        } else {
            if (!isClassical) game.setSurrenderSocketId(playerSocket.id);
        }
        this.sendObserverJoinableGames();
    }

    /* eslint-disable */
    private getLobbyId(cardId: string, playerName: string, playerId: string): string[] {
        const lobbies = this.waitingRooms.get(cardId);
        const lobbyIds: string[] = [];
        if (lobbies) {
            for (const [key, values] of lobbies) {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < values.players.length; i++) {
                    if (values.players[i].pseudo === playerName && values.players[i].socketId === playerId) {
                        lobbyIds.push(key);
                    }
                }
            }
        }
        return lobbyIds;
    }

    private getMapInArrayForm() {
        // cardId, lobbyId, players --Sidney
        const waitingRoomsObject: { [key: string]: { [key: string]: Lobby } } = {};
        this.waitingRooms.forEach((innerMap, key) => {
            const innerObject: { [key: string]: Lobby } = {};
            innerMap.forEach((lobby, innerKey) => {
                const pseudoArray = [];
                lobby.players.forEach((item) => {
                    pseudoArray.push(item.pseudo);
                });
                innerObject[innerKey] = { players: pseudoArray, lobbyType : lobby.lobbyType };
            });
            waitingRoomsObject[key] = innerObject;
        });
        return waitingRoomsObject;
    }
}
