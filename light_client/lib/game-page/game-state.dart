import 'dart:async' as asyncTimer;
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/accounts-page/accounts-state.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/draw-image/bmp-converter.dart';
import 'package:namer_app/end-game/end-game-dialog.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';
import 'package:namer_app/general-classes/added-difference.dart';
import 'package:namer_app/general-classes/coordinate.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game-constants-data.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/general-classes/limited-time-init-io.dart';
import 'package:namer_app/general-classes/limited-time-io.dart';
import 'package:namer_app/general-classes/oberserver-interaction-info.dart';
import 'package:namer_app/general-classes/player-io.dart';
import 'package:namer_app/general-classes/player.dart';
import 'package:namer_app/general-classes/success-click.dart';
import 'package:namer_app/general-classes/video-replay-data.dart';
import 'package:namer_app/general-classes/winner.dart';
import 'package:namer_app/limited-time/limited-time-service.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/main.dart';
import 'package:namer_app/observer-page/observer_game.dart';
import 'package:namer_app/player/player-service.dart';
import 'package:namer_app/socket-service.dart/game-socket-service.dart';
import 'package:namer_app/sound/sound-service.dart';
import 'package:namer_app/timer/timer-service.dart';
import 'package:namer_app/video-replay/video-replay-state.dart';

class GameState extends ChangeNotifier {
  static final GameState _instance = GameState._internal();
  late GameSocketService socket;
  var messages = <ChatEntry>[];
  bool isWinner = false;
  bool isObserver = false;
  late ObserverGame observerGame;
  late int leaderboardPosition;
  List<Uint8List> allFilters = [];
  List<Uint8List> allOriginalImageFilters = [];
  List<Uint8List> originalImageFilters = [];
  List<Uint8List> activeFilters = [];
  List<Uint8List> activeOriginalFilters = [];
  late Uint8List originalImage;
  late Uint8List modifiedImage;
  late GameCardInfo cardInfo;
  late Game game;
  late PlayerService playerService = PlayerService();
  late TimerService timerService;
  late int startTimeSinceEpoch = 0;
  bool isFlashVisible = false;
  bool isCheatModeOn = false;
  bool gameIsWatched = false;
  int observerCount = 0;
  bool gameLimitedIsQuit = false;

  late asyncTimer.Timer? timer = null;
  late asyncTimer.Timer? timerPeriodic = null;
  SoundService soundService = SoundService();
  bool isClickDisabledOnError = false;
  late GameConstantsData constantsData =
      GameConstantsData(initial: 30, penalty: 5, gain: 5, isCheatMode: false);
  late int numberOfDifferencesRemaining = 999;
  late Future<bool> areLimitedImagesLoaded = Future.value(false);
  late var updatedCardInfo;
  late List<List<Coordinate>> alreadyFoundDifferences = [];
  late ObserverInteractionInfo observerRectangleData =
      const ObserverInteractionInfo(
          coords: [], senderId: '', isRightSide: false);
  late bool isReplay = false;
  late bool isRestartCalled = false;
  int observerIndex = 0;
  Map<String, Color> _observerColors = {};

  static const List<Color> COLOR_ARRAY = [
    Color.fromARGB(255, 102, 204, 0), // GREEN
    Color.fromARGB(255, 0, 0, 255), // BLUE
    Color.fromARGB(255, 255, 0, 0), // RED
    Color.fromARGB(255, 255, 128, 0), // ORANGE
    Color.fromARGB(255, 255, 102, 255), // YELLOW
    Color.fromARGB(255, 76, 0, 153), // PURPLE
    Color.fromARGB(153, 102, 51, 153), // BROWN
  ];

  factory GameState() {
    return _instance;
  }

  GameState._internal() {
    socket = GameSocketService();
    handleSocket();
  }

  TimerService get getTimerService => TimerService();

  void reset() {
    TimerService timerService = TimerService();
    LimitedTimeService limitedTimeService = LimitedTimeService();
    messages = [];
    allFilters = [];
    allOriginalImageFilters = [];
    originalImageFilters = [];
    activeFilters = [];
    activeOriginalFilters = [];
    game.reset();
    playerService.opponents = [];
    timerService = TimerService();
    timerService.updateTime(0);
    isClickDisabledOnError = false;
    constantsData =
        GameConstantsData(initial: 30, penalty: 5, gain: 5, isCheatMode: false);
    isCheatModeOn = false;
    numberOfDifferencesRemaining = 0;
    areLimitedImagesLoaded = Future.value(false);
    gameIsWatched = false;
    observerCount = 0;
    alreadyFoundDifferences = [];
    limitedTimeService.originalImages = [];
    limitedTimeService.modifiedImages = [];
    limitedTimeService.leftFilters = [];
    limitedTimeService.rightFilters = [];
    limitedTimeService.cardIds = [];
    limitedTimeService.currentCardIndex = 0;
    gameLimitedIsQuit = false;
    notifyListeners();
  }

  void resetAtHomePage() {
    (isReplay) ? originalImage = originalImage : originalImage = Uint8List(0);
    (isReplay) ? modifiedImage = modifiedImage : modifiedImage = Uint8List(0);
  }

  Future<void> videoReplaySetup(
      GameCardInfo gameCardInfo, GameConstantsData gameConstantsData) async {
    cardInfo = gameCardInfo;
    game = Game(
        id: gameCardInfo.id,
        gameTitle: gameCardInfo.title,
        firstMode: FirstGameMode.CLASSIC,
        difficulty: gameCardInfo.difficultyLevel);
    constantsData = gameConstantsData;
    await setGameDifferences();
    setMainImages(gameCardInfo.id);
  }

  void saveReplaySocket(VideoReplayData videoReplayData) {
    socket.sendVideoReplay('saveReplay', videoReplayData);
  }

  void clearObserverRectangleData() {
    observerRectangleData = const ObserverInteractionInfo(
        coords: [], senderId: '', isRightSide: false);
    notifyListeners();
  }

  Color getObserverColor(String observerId) {
    if (_observerColors.containsKey(observerId)) {
      return _observerColors[observerId]!;
    }

    Color color = COLOR_ARRAY[_observerColors.length % COLOR_ARRAY.length];
    _observerColors[observerId] = color;
    return color;
  }

  Future<void> setGameDifferences() async {
    numberOfDifferencesRemaining = cardInfo.differences.length;
    for (int i = 0; i < cardInfo.differences.length; i++) {
      String filterId = '${game.id}_$i';

      Uint8List filter = await ConvertBmpImage.pngToImgImage(
          "${getServerUrlApi()}/image/filter/${filterId}_modified");
      allFilters.add(filter);

      Uint8List originalImageFilter = await ConvertBmpImage.pngToImgImage(
          "${getServerUrlApi()}/image/filter/${filterId}_original");
      originalImageFilters.add(originalImageFilter);
      allOriginalImageFilters.add(originalImageFilter);
    }
  }

  Future<void> setMainImages(String id) async {
    originalImage = await ConvertBmpImage.bmpToImgImage(
        "${getServerUrlApi()}/image/light/${id}_original");
    modifiedImage = await ConvertBmpImage.bmpToImgImage(
        "${getServerUrlApi()}/image/light/${id}_modified");
  }

  void showEndGameDialog() {
    showDialog(
      context: MyApp.navigatorKey.currentState!.context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        ThemeState themeState = ThemeState();
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          content: SizedBox(
            height: MediaQuery.of(context).size.height / 2,
            child: EndGameDialog(),
          ),
        );
      },
    );
  }

  void endGame() {
    showEndGameDialog();
  }

  void handleEndGame(bool isWinnerFromSocket) {
    isWinner = isWinnerFromSocket;
    endGame();
  }

  void handleWinner(Winner winnerData) {
    isWinner = winnerData.socketId == socket.gameSocket.id;
    endGame();
  }

  void setPlayerService(dynamic data) {
    if (playerService.opponents.isEmpty) {
      var playerData = jsonDecode(data);
      for (var entry in playerData) {
        String playerPseudo = entry['pseudo'];
        if (playerPseudo != AccountService.accountPseudo) {
          Player newPlayer = Player(pseudo: playerPseudo, differenceCount: 0);
          playerService.opponents.add(newPlayer);
          AccountsState accountsState = AccountsState();
          accountsState.socket.sendSocketMessage('getRank', playerPseudo);
        } else {
          playerService.self = Player(
              pseudo: AccountService.accountPseudo,
              differenceCount: 0,
              displayRank:
                  AccountService.findAccountRankName(AccountService.rank));
        }
      }
    }
  }

  void setRank(dynamic data) {
    var rankData = jsonDecode(data);
    String pseudo = rankData['pseudo'];
    print('in setRank for $pseudo');
    int rank = rankData['rank'];
    print('rank: $rank');
    Player player = playerService.getPlayer(pseudo);
    player.displayRank = AccountService.findAccountRankName(rank);
  }

  void setPlayerServiceFromPlayerIO(List<PlayerIO> playerIOs) {
    if (playerService.opponents.isEmpty) {
      for (PlayerIO playerIO in playerIOs) {
        String playerPseudo = playerIO.pseudo;
        if (playerPseudo != AccountService.accountPseudo) {
          Player newPlayer = Player(pseudo: playerPseudo, differenceCount: 0);
          playerService.opponents.add(newPlayer);
        } else {
          playerService.self =
              Player(pseudo: AccountService.accountPseudo, differenceCount: 0);
        }
      }
    }
  }

  void enterGame(dynamic data) {
    isObserver = false;
    setPlayerService(data);
    BuildContext context = MyApp.navigatorKey.currentState!.context;
    LobbyState lobbyState = LobbyState();
    lobbyState.reset();
    gameLimitedIsQuit = false;
    Navigator.pushReplacementNamed(context, '/game', arguments: {
      'cardId': cardInfo.id,
      'firstMode': game.firstMode.value,
    });
  }

  void enterGameAsObserver(
      BuildContext context, dynamic data, String cardId, FirstGameMode mode) {
    isObserver = true;
    setPlayerService(data);
    Navigator.pushReplacementNamed(context, '/game', arguments: {
      'cardId': cardId,
      'firstMode': mode.value,
    });
  }

  bool isFirstElementContained(List<Coordinate> difference) {
    if (alreadyFoundDifferences.isEmpty || difference.isEmpty) {
      return false;
    }

    final firstDifference = difference.first;

    for (final list in alreadyFoundDifferences) {
      if (list.isNotEmpty && list.first == firstDifference) {
        return true;
      }
    }

    return false;
  }

  void handleSuccess(dynamic data) {
    clearObserverRectangleData();
    SuccessClick successInfo = SuccessClick.fromJson(jsonDecode(data));

    if (game.firstMode == FirstGameMode.CLASSIC ||
        game.firstMode == FirstGameMode.REFLEX) {
      int differenceIndex = getDifferenceIndex(successInfo.differences[0]);
      if (!isFirstElementContained(successInfo.differences)) {
        alreadyFoundDifferences.add(successInfo.differences);
        showClickedDifferenceFromIndex(differenceIndex);
        soundService.playSuccessSound();
        playerService.incrementPlayerDiffCount(successInfo.pseudo);
        if (game.firstMode == FirstGameMode.REFLEX) {
          playerService
              .decrementPlayerDiffCount(playerService.opponents[0].pseudo);
        }
      }
    }
  }

  void handleAddDifference(dynamic data) {
    AddedDifference addedDifference =
        AddedDifference.fromJson(jsonDecode(data));

    numberOfDifferencesRemaining++;

    int differenceIndex =
        getDifferenceIndex(addedDifference.addedDifference[0]);
    removeDifferenceFromIndex(differenceIndex);
    playerService.incrementPlayerDiffCount(playerService.opponents[0].pseudo);
    playerService.decrementPlayerDiffCount(addedDifference.pseudo);
  }

  void handleError() {
    clearObserverRectangleData();
    isClickDisabledOnError = true;
    soundService.playErrorSound();
    notifyListeners();
    asyncTimer.Timer(Duration(seconds: 1), () {
      isClickDisabledOnError = false;
      notifyListeners();
    });
  }

  int getDifferenceIndex(Coordinate firstCoord) {
    for (int i = 0; i < cardInfo.differences.length; i++) {
      if (firstCoord == cardInfo.differences[i][0]) return i;
    }
    return -1;
  }

  void removeDifferenceFromIndex(int index) {
    int activeFiltersIndex = activeFilters.indexOf(allFilters[index]);
    activeFilters.remove(allFilters[index]);
    alreadyFoundDifferences.removeAt(activeFiltersIndex);
    originalImageFilters.add(allOriginalImageFilters[index]);
  }

  void showClickedDifferenceFromIndex(int index) {
    bool isVisible = false;
    numberOfDifferencesRemaining--;
    timerPeriodic =
        asyncTimer.Timer.periodic(Duration(milliseconds: 125), (timer) {
      if (index < allFilters.length || index < allOriginalImageFilters.length) {
        if (!isVisible) {
          try {
            activeFilters.add(allFilters[index]);
            activeOriginalFilters.add(allOriginalImageFilters[index]);
          } catch (e) {
            print(e);
          }
        } else {
          activeFilters.remove(allFilters[index]);
          activeOriginalFilters.remove(allOriginalImageFilters[index]);
        }
        notifyListeners();
        if (timer.tick >= 8) {
          if (!isVisible) {
            activeOriginalFilters.remove(allOriginalImageFilters[index]);
          } else {
            activeFilters.add(allFilters[index]);
          }
          originalImageFilters.remove(allOriginalImageFilters[index]);
          notifyListeners();
          timer.cancel();
        }
        isVisible = !isVisible;
      }
    });
  }

  void initializeReflex(String data) {
    List<PlayerIO> playerIOs =
        playerIOListFromJson(jsonDecode(data)['players']);
    setPlayerServiceFromPlayerIO(playerIOs);
    List<List<Coordinate>> differences =
        coordinateListListFromJson(jsonDecode(data)['initialDifferences']);
    for (int i = 0; i < differences.length; i++) {
      playerService.incrementPlayerDiffCount(playerService.self.pseudo);
      playerService.incrementPlayerDiffCount(playerService.opponents[0].pseudo);

      int index = getDifferenceIndex(differences[i][0]);
      numberOfDifferencesRemaining--;
      activeFilters.add(allFilters[index]);
      alreadyFoundDifferences.add(differences[i]);
      originalImageFilters.remove(allOriginalImageFilters[index]);

      notifyListeners();
    }
  }

  void showClickedDifferenceWithoutIndexOrFlash(dynamic data) {
    SuccessClick successInfo = SuccessClick.fromJson(jsonDecode(data));
    playerService.incrementPlayerDiffCount(successInfo.pseudo);
    int index = getDifferenceIndex(successInfo.differences[0]);

    numberOfDifferencesRemaining--;
    activeFilters.add(allFilters[index]);
    alreadyFoundDifferences.add(successInfo.differences);

    notifyListeners();
  }

  int getOffsetIndex(Coordinate coord) {
    return (4 * (coord.y * 640 + coord.x)) + 54;
  }

  bool isPixelTransparent(Uint8List image, Coordinate coord) {
    return image[getOffsetIndex(coord) + 3] == 0;
  }

  sendMessage(String message) {
    ChatEntry data =
        ChatEntry(message, '', ChatEntryType.USER, playerService.self.pseudo);
    socket.sendChat('message', data);
  }

  void abandonGame(bool isSurrender) {
    // HERE history
    BuildContext context = MyApp.navigatorKey.currentState!.context;
    if (isObserver) {
      socket.send('observerQuit');
    } else if (isSurrender) {
      socket.send('surrender');
    }
    reset();
    Navigator.pushReplacementNamed(context, '/home');
  }

  void handleCardChange(LimitedTimeIO limitedTimeIO) {
    LimitedTimeService limitedTimeService = LimitedTimeService();
    game = Game(
        id: limitedTimeIO.card.id,
        gameTitle: limitedTimeIO.card.title,
        firstMode: FirstGameMode.LIMITED_TIME,
        difficulty: limitedTimeIO.card.difficultyLevel);
    cardInfo = limitedTimeIO.card;

    if (limitedTimeService.cardIds.isNotEmpty &&
        limitedTimeIO.card.id !=
            limitedTimeService.cardIds[limitedTimeService.currentCardIndex]) {
      limitedTimeService.currentCardIndex++;
      print(limitedTimeService.currentCardIndex);
      if (isObserver) {
        playerService
            .setAllPlayersDiffCount(limitedTimeService.currentCardIndex - 1);
      } else {
        playerService
            .setAllPlayersDiffCount(limitedTimeService.currentCardIndex);
      }
    }

    notifyListeners();
  }

  void setPlayerScores(dynamic data) {
    asyncTimer.Timer(Duration(milliseconds: 500), () {
      dynamic parsedData = jsonDecode(data);
      print(data);
      for (dynamic element in parsedData) {
        String pseudo = element['name'];
        print('pseudo: $pseudo');
        int foundDifferencesCount = element['foundDifferencesCount'];
        print('diffCount: $foundDifferencesCount');
        playerService.setPlayerDiffCount(pseudo, foundDifferencesCount);
      }
      notifyListeners();
    });
  }

  void videoReplayToggleFlash() {
    VideoReplayState videoReplayState = VideoReplayState();
    videoReplayState.addGameEventToEvents('toggleFlash', [],
        DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);

    toggleFlashMode();
  }

  void toggleFlashMode() {
    isCheatModeOn = !isCheatModeOn;
    if (isCheatModeOn) {
      if (timer == null || !timer!.isActive) {
        startFlash();
      }
    } else {
      stopFlash();
    }
    notifyListeners();
  }

  void startFlash() {
    // VIDEO REPLAY cheat ON
    timer = asyncTimer.Timer.periodic(Duration(milliseconds: 125),
        (asyncTimer.Timer timer) {
      isFlashVisible = !isFlashVisible;
      notifyListeners();
    });
  }

  void stopFlash() {
    timer?.cancel();
    isFlashVisible = false;
    notifyListeners();
  }

  void stopFlashIfNecessary() {
    // VIDEO REPLAY cheat OFF
    if (timer != null && timer!.isActive) {
      VideoReplayState videoReplayState = VideoReplayState();
      videoReplayState.addGameEventToEvents('stopFlash', [],
          DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);
      stopFlash();
    }
    notifyListeners();
  }

  void videoReplayStart(dynamic data) {
    VideoReplayState videoReplayState = VideoReplayState();
    startTimeSinceEpoch = DateTime.now().millisecondsSinceEpoch;
    videoReplayState.addGameEventToEvents('start', [data], 0);

    isReplay = false;
    enterGame(data);
  }

  void videoReplayHandleSuccess(dynamic data) {
    VideoReplayState videoReplayState = VideoReplayState();
    videoReplayState.addGameEventToEvents('handleSuccess', [data],
        DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);

    handleSuccess(data);
  }

  void videoReplayHandleError() {
    VideoReplayState videoReplayState = VideoReplayState();
    videoReplayState.addGameEventToEvents('handleError', [],
        DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);

    handleError();
  }

  void videoReplayUpdateTime(dynamic data) {
    VideoReplayState videoReplayState = VideoReplayState();
    videoReplayState.addGameEventToEvents(
        'updateTime',
        [double.parse(data).round()],
        DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);
    timerService = TimerService();
    timerService.updateTime(double.parse(data).round());
  }

  void videoReplayHandleWinner(Winner winnerData) {
    VideoReplayState videoReplayState = VideoReplayState();
    videoReplayState.addGameEventToEvents('handleWinner', [winnerData],
        DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);

    handleWinner(winnerData);
  }

  void videoReplayHandleEndGame(bool isWinner) {
    VideoReplayState videoReplayState = VideoReplayState();
    videoReplayState.addGameEventToEvents('handleEndGame', [isWinner],
        DateTime.now().millisecondsSinceEpoch - startTimeSinceEpoch);

    handleEndGame(isWinner);
  }

  void handleSocket() {
    socket.addCallbackToMessage('startGame', (data) {
      videoReplayStart(data);
    });
    socket.addCallbackToMessage(
        'success', (data) => {videoReplayHandleSuccess(data)});

    socket.addCallbackToMessage('error', (data) => {videoReplayHandleError()});

    socket.addCallbackToMessage(
        'clock', (data) => {videoReplayUpdateTime(data)});

    socket.addCallbackToMessage('cardChange', (data) {
      LimitedTimeIO limitedTimeIO = LimitedTimeIO.fromJson(jsonDecode(data));
      handleCardChange(limitedTimeIO);
    });

    socket.addCallbackToMessage('limitedTimeInit', (data) {
      LimitedTimeService limitedTimeService = LimitedTimeService();
      numberOfDifferencesRemaining = 1;
      LimitedTimeInitIO limitedTimeInitIO =
          LimitedTimeInitIO.fromJson(jsonDecode(data));

      cardInfo = limitedTimeInitIO.cards[0];
      areLimitedImagesLoaded = limitedTimeService.setImages(limitedTimeInitIO);
    });

    socket.addCallbackToMessage(
        'message',
        (data) => {
              messages.add((data.runtimeType == String)
                  ? ChatEntry.fromJson(jsonDecode(data))
                  : ChatEntry.fromJson(data)),
              notifyListeners()
            });

    socket.addCallbackToMessage(
        'actualGameState',
        (data) => {
              updatedCardInfo = jsonDecode(data),
            });

    socket.addCallbackToMessage('observerInteraction', (data) {
      ObserverInteractionInfo interactionData =
          ObserverInteractionInfo.fromJson(jsonDecode(data));
      observerRectangleData = interactionData;
      notifyListeners();
    });

    socket.addCallbackToMessage(
        'winner',
        (data) => {
              stopFlashIfNecessary(),
              videoReplayHandleWinner(
                  Winner.fromJson(jsonDecode(data as String)))
            });

    socket.addCallbackToMessage(
        'endGame',
        (isWinner) => {
              stopFlashIfNecessary(),
              videoReplayHandleEndGame(jsonDecode(isWinner as String) as bool)
            });

    socket.addCallbackToMessage(
        'playerQuit', (data) => gameLimitedIsQuit = true);

    socket.addCallbackToMessage('reflexInit', (data) => initializeReflex(data));

    socket.addCallbackToMessage(
        'addDifference', (data) => handleAddDifference(data));

    socket.addCallbackToMessage(
        'opponentIncrement',
        (data) => playerService
            .incrementPlayerDiffCount(playerService.opponents[0].pseudo));

    socket.addCallbackToMessage(
        'playersCount', (data) => setPlayerScores(data));

    socket.addCallbackToMessage('observerWatching', (data) {
      int observerCountData = jsonDecode(data.toString());
      gameIsWatched = observerCountData != 0;
      observerCount = observerCountData;
    }); // Quand on se fait observer
  }
}
