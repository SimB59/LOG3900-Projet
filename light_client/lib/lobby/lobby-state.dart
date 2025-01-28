import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:namer_app/general-classes/coordinate.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game-constants-data.dart';
import 'package:namer_app/general-classes/game-constants-io.dart';
import 'package:namer_app/general-classes/lobby-io.dart';
import 'package:namer_app/general-classes/lobby-type.dart';
import 'package:namer_app/general-classes/lobby.dart';
import 'package:namer_app/general-classes/start-game-data.dart';
import 'package:namer_app/main.dart';
import 'package:namer_app/observer-page/observer_game.dart';
import 'package:namer_app/selection-page/cards-state.dart';

class LobbyState extends ChangeNotifier {
  static final LobbyState _instance = LobbyState._internal();
  //TODO: verify observerGames
  late Map<String, ObserverGame> observerGames = {};
  late bool isInLobby;
  late bool isGameCreator;
  late Map<String, Map<String, Lobby>> playersLobby =
      <String, Map<String, Lobby>>{};
  late GameCardInfo lastUsedCard;
  late String lobbyId;
  late bool isCallBackAlreadySet;
  late LobbyType lobbyType = LobbyType.PUBLIC;
  late GameConstantsIO gameConstantsIO = const GameConstantsIO(
      initial: 30,
      penalty: 5,
      gain: 5,
      isCheatMode: false,
      lobbyId: '',
      cardId: '');

  bool constantsContainUnconfirmedChanges = false;

  // This is used to avoid null error when lobby is deleted on server but lobbyPage isn't closed yet
  // Specifically: lobbyPage around line 211
  List<String> tempPlayers = [];

  factory LobbyState() {
    return _instance;
  }

  LobbyState._internal() {
    isInLobby = false;
    isCallBackAlreadySet = false;
    isGameCreator = false;
    handleSocket();
  }

  void enterLimitedTimeLobby(bool isCreator, [String lobbyIdParam = '']) async {
    GameState gameState = GameState();
    isGameCreator = isCreator;
    if (isGameCreator) {
      lobbyId =
          'Limited_${AccountService.accountPseudo}_${DateTime.now().millisecondsSinceEpoch}';
    } else {
      lobbyId = lobbyIdParam;
    }

    gameState.numberOfDifferencesRemaining = 1;

    LobbyIO lobbyIO = LobbyIO(
        cardId: 'Limited',
        firstMode: gameState.game.firstMode.value,
        playerName: AccountService.accountPseudo,
        lobbyId: lobbyId,
        lobbyType: lobbyType);
    if (isGameCreator) {
      gameState.socket.send('createWaitingRoom', jsonEncode(lobbyIO.toJson()));
    } else {
      gameState.socket.send('addPlayer', jsonEncode(lobbyIO.toJson()));
    }
    isInLobby = true;
  }

  void enterLobby(bool isCreator, String firstGameModeString,
      [String lobbyIdParam = '']) async {
    GameState gameState = GameState();
    isGameCreator = isCreator;
    if (isGameCreator) {
      lobbyId =
          '${firstGameModeString}_${AccountService.accountPseudo}_${DateTime.now().millisecondsSinceEpoch}_${gameState.game.id}';
    } else {
      lobbyId = lobbyIdParam;
    }
    LobbyIO lobbyIO = LobbyIO(
        cardId: gameState.game.id,
        firstMode: gameState.game.firstMode.value,
        playerName: AccountService.accountPseudo,
        lobbyId: lobbyId,
        lobbyType: lobbyType);
    if (isGameCreator) {
      gameState.socket.send('createWaitingRoom', jsonEncode(lobbyIO.toJson()));
    } else {
      gameState.socket.send('addPlayer', jsonEncode(lobbyIO.toJson()));
    }
    isInLobby = true;

    tempPlayers = [];
    gameState.setGameDifferences();
    gameState.setMainImages(gameState.game.id);
  }

  Future<List<String>> getPlayersAsync(String cardId) async {
    if (playersLobby.containsKey(cardId) &&
        playersLobby[cardId]!.containsKey(lobbyId) &&
        playersLobby[cardId]![lobbyId]!.players.isNotEmpty) {
      return playersLobby[cardId]![lobbyId]!.players;
    }
    return [];
  }

  bool lobbyExists(String cardId) {
    return playersLobby[cardId] != null &&
        playersLobby[cardId]![lobbyId] != null;
  }

  void setConstantsContainUnconfirmedChanges(bool newValue) {
    constantsContainUnconfirmedChanges = newValue;
    notifyListeners();
  }

  List<String> getPlayers(String cardId) {
    if (tempPlayers.isEmpty && lobbyExists(cardId)) {
      return playersLobby[cardId]![lobbyId]!.players;
    } else {
      return tempPlayers;
    }
  }

  void reset() {
    // tempPlayers is there to avoid an error when waiting room is
    // destroyed on server but we're not yet on gamePage
    // Therefore, I wait a few seconds to make sure we're on gamePage before resetting it
    Timer(const Duration(seconds: 3), () {
      tempPlayers = [];
    });
    isGameCreator = false;
    lobbyId = '';
    isInLobby = false;
    gameConstantsIO = const GameConstantsIO(
        initial: 30,
        penalty: 5,
        gain: 5,
        isCheatMode: false,
        lobbyId: '',
        cardId: '');
  }

  void handleSocket() {
    GameState gameState = GameState();
    CardsState cardsState = CardsState();
    if (!isCallBackAlreadySet) {
      gameState.socket.addCallbackToMessage(
          'lobbyModification',
          (lobbyData) => {
                playersLobby = LobbyState.convertBackToMap(lobbyData as String),
                if (isGameCreator)
                  {
                    gameState.socket.send('updateLobbyConstants',
                        jsonEncode(gameConstantsIO.toJson()))
                  },
                notifyListeners()
              });
      gameState.socket.addCallbackToMessage(
          'joinRequestRejected',
          (data) => {
                // this.dialog.closeAll();
                //         this.alertService.generatePopUp(Message.HostReject, false);
                //         this.isInLobby = false;
              });
      gameState.socket.addCallbackToMessage('createAborted',
          (lobbyData) => {showLobbyBrokenDialog(), notifyListeners()});
      gameState.socket.addCallbackToMessage(
          'updateLobbyConstants',
          (data) => {
                gameState.constantsData =
                    GameConstantsData.fromJson(jsonDecode(data)),
                notifyListeners()
              });
      cardsState.socket.addCallbackToMessage('cardDeleted', (cardDelete) {
        handleCardDelete(cardDelete as String);
      });
      gameState.socket.addCallbackToMessage(
          'observerModification',
          (observerData) => {
                handleObserverModification(observerData as String),
              });
      gameState.socket.addCallbackToMessage(
          'observerDifferences',
          (data) => {
                handleObserverDifferences(data),
              });

      isCallBackAlreadySet = true;
    }
  }

  void handleObserverDifferences(data) {
    GameState gameState = GameState();
    final updatedDifferences = json.decode(data);
    gameState.alreadyFoundDifferences =
        coordinateListListFromJson(updatedDifferences);
  }

  void handleObserverModification(String data) {
    // Decode the JSON data, which is expected to be a List of Maps
    final observerList = json.decode(data) as List<dynamic>;
    observerGames = {};
    for (var observerData in observerList) {
      final observerMap = observerData as Map<String, dynamic>;

      final gameRoomName = observerMap['gameRoomName'] as String;
      final cardId = observerMap['cardId'] as String;
      final playerCount = observerMap['playerCount'] as int;
      final observerCount = observerMap['observerCount'] as int;

      // If you expect 'players' field in the observerMap, use the following line:
      // Note: Ensure the 'players' field is being sent from the server.
      final players = observerMap['players'] ??
          []; // Assuming it's optional and providing an empty list as default

      observerGames[cardId] = ObserverGame(
        gameRoomName,
        playerCount,
        observerCount,
        List<String>.from(players),
      );
    }
    notifyListeners();
  }

  void handleCardDelete(String cardId) async {
    GameState gameState = GameState();
    CardsState cardsState = CardsState();
    TranslationState translationState = TranslationState();
    if (isInLobby && cardId == gameState.game.id) {
      isInLobby = false;
      await showCardDeleteDialog(
        translationState.currentLanguage[
            'The game card for the current lobby has been deleted']!,
      );
    }
    if (isInLobby &&
        cardsState.activeCardsData.isEmpty &&
        gameState.game.firstMode == FirstGameMode.LIMITED_TIME) {
      isInLobby = false;
      await showCardDeleteDialog(
        translationState
            .currentLanguage['There are no more cards available to play with']!,
      );
    }
  }

  void startGame(
      String cardId, FirstGameMode gameType, GameConstantsData constants) {
    StartGameData startGameData = StartGameData(
        lobbyId: lobbyId,
        cardId: cardId,
        firstMode: gameType,
        constants: constants);

    isInLobby = false;
    tempPlayers = playersLobby[cardId]![lobbyId]!.players;

    GameState gameState = GameState();
    gameState.socket.send('startGame', jsonEncode(startGameData.toJson()));
  }

  static Map<String, Map<String, Lobby>> convertBackToMap(String data) {
    Map<String, dynamic> waitingRoomsObject = json.decode(data);
    var waitingRooms = <String, Map<String, Lobby>>{};

    waitingRoomsObject.forEach((key, innerObject) {
      var innerMap = <String, Lobby>{};
      (innerObject as Map<String, dynamic>).forEach((innerKey, value) {
        innerMap[innerKey] = Lobby(
            players: List<String>.from(value['players']),
            lobbyType: LobbyTypeExtension.fromString(value['lobbyType']));
      });
      waitingRooms[key] = innerMap;
    });

    return waitingRooms;
  }

  Future<void> showCardDeleteDialog(String message) async {
    BuildContext context = MyApp.navigatorKey.currentState!.context;
    TranslationState translationState = TranslationState();
    ThemeState themeState = ThemeState();
    return showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AlertDialog(
            backgroundColor: themeState.currentTheme['Dialog Background'],
            title: Text(
              translationState.currentLanguage['Card deleted']!,
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
            content: Text(message, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
            actions: <Widget>[
              TextButton(
                child: Text(
                  translationState.currentLanguage['Close']!,
                  style: TextStyle(color: themeState.currentTheme['Button foreground']),
                ),
                onPressed: () {
                  Navigator.of(context).pop();
                  Navigator.pushReplacementNamed(context, '/home');
                },
              )
            ],
          );
        });
  }

  Future<void> showLobbyBrokenDialog() async {
    BuildContext context = MyApp.navigatorKey.currentState!.context;
    TranslationState translationState = TranslationState();
    ThemeState themeState = ThemeState();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(translationState.currentLanguage['Lobby broken']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
          content: Text(
            translationState
                .currentLanguage['Game creator has left the lobby']!,
                style: TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          actions: <Widget>[
            TextButton(
              child: Text(translationState.currentLanguage['Close']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
              onPressed: () {
                isInLobby = false;
                Navigator.pushReplacementNamed(context, '/home');
              },
            )
          ],
        );
      },
    );
  }

  bool isLobbiesEmptyExceptForLimited() {
    if (playersLobby.isEmpty) {
      return false;
    }
    return playersLobby.length == 1 && playersLobby.containsKey('Limited');
  }

  Map<String, Lobby> getJoinableLobbies(
      String cardId, FirstGameMode firstGameMode) {
    AccountFriendService accountFriendService = AccountFriendService();
    Map<String, Lobby> joinableLobbies = <String, Lobby>{};
    if ((!isLobbiesEmptyExceptForLimited() ||
            firstGameMode == FirstGameMode.LIMITED_TIME) &&
        playersLobby.containsKey(cardId)) {
      playersLobby[cardId]!.forEach((lobbyId, lobby) {
        // 1. Validate firstGameMode (classic vs reflex)
        List<String> lobbyIdElements = lobbyId.split(RegExp(r'_'));
        String firstGameModeString = lobbyIdElements[0];

        if (firstGameModeString == firstGameMode.value) {
          // 2. Check if Friends only
          if (lobby.lobbyType == LobbyType.FRIENDS &&
              accountFriendService.accountFriendData.friendList
                  .map((FriendData friend) => friend.pseudo)
                  .contains(lobby.players[0])) {
            joinableLobbies.putIfAbsent(lobbyId, () => lobby);
          }
          // 3. Check if Friends of friends
          else if (lobby.lobbyType == LobbyType.FRIENDS_OF_FRIENDS &&
              accountFriendService.friendsOFriends
                  .map((FriendData friend) => friend.pseudo)
                  .contains(lobby.players[0])) {
            joinableLobbies.putIfAbsent(lobbyId, () => lobby);
          }
          // 4. Public: check if blocked
          else if (lobby.lobbyType == LobbyType.PUBLIC) {
            bool isLobbyAvailable = true;
            for (String player in lobby.players) {
              if (accountFriendService.accountFriendData.blockedByList
                  .map((FriendData friend) => friend.pseudo)
                  .contains(player)) {
                isLobbyAvailable = false;
              }
            }
            if (isLobbyAvailable) {
              joinableLobbies.putIfAbsent(lobbyId, () => lobby);
            }
          }
        }
      });
    }

    return joinableLobbies;
  }

  List<int> getRange(String cardId, FirstGameMode firstGameMode) {
    final playerMap = getJoinableLobbies(cardId, firstGameMode);
    return List.generate(playerMap.length, (index) => index);
  }
}
