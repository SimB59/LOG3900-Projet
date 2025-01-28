import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game-constants-data.dart';
import 'package:namer_app/general-classes/game-event.dart';
import 'package:namer_app/general-classes/video-replay-data.dart';

class VideoReplayState extends ChangeNotifier {
  static final VideoReplayState _instance = VideoReplayState._internal();
  late List<GameEvent> events;
  late bool isPaused = false;
  late int speed = 1;
  late int currentTime = 0;
  late bool isAborted = false;
  late int shownTime = 0;
  late bool isReplayButtonActive = true;
  late bool isVideoReplayDialog = false;

  factory VideoReplayState() {
    return _instance;
  }

  VideoReplayState._internal() {
    events = [];
  }

  void changeIsReplayButtonActive(bool value) {
    isReplayButtonActive = value;
    notifyListeners();
  }

  void saveReplay(String cardId, String cardName,
      GameConstantsData gameConstantsData, List<String> playerOpponentNames) {
    VideoReplayData videoReplayData = VideoReplayData(
        accountId: AccountService.accountUserId,
        pseudo: AccountService.accountPseudo,
        playerSharingName: AccountService.accountPseudo,
        gameEvents: events,
        cardId: cardId,
        cardName: cardName,
        constants: gameConstantsData,
        videoId: '${AccountService.accountPseudo}_${cardId}_${DateTime.now()}',
        playerOpponentNames: playerOpponentNames,
        isPublic: false,
        date: DateFormat('yyyy-M-d').format(DateTime.now()));
    GameState gameState = GameState();
    gameState.saveReplaySocket(videoReplayData);
  }

  void addGameEventToEvents(
      String method, List<dynamic> params, int timestamp) {
    events.add(GameEvent(method: method, timestamp: timestamp, params: params));
  }

  bool execute(GameEvent gameEvent) {
    selectFunction(gameEvent);
    return true;
  }

  Future<void> executeGameEvent(GameEvent gameEvent) async {
    Completer<bool> completer = Completer<bool>();

    void executeOnTimestamp() {
      if (isAborted) {
        completer.complete(false);
        return;
      }
      if (!isPaused) {
        currentTime += 10 * speed;
        shownTime = currentTime;
        notifyListeners();
      }

      if (currentTime >= gameEvent.timestamp) {
        completer.complete(execute(gameEvent));
      } else {
        Future.delayed(Duration(milliseconds: 10), executeOnTimestamp);
      }
    }

    executeOnTimestamp();
    await completer.future;
  }

  Future<void> restart() async {
    GameState gameState = GameState();
    stop();

    Completer<bool> completer = Completer<bool>();

    void waitForPreviousReplayCompleted() {
      if (!gameState.isReplay) {
        completer.complete(true);
      } else {
        Future.delayed(
            Duration(milliseconds: 10), waitForPreviousReplayCompleted);
      }
    }

    waitForPreviousReplayCompleted();
    await completer.future;
    if (gameState.timerPeriodic != null) {
      gameState.timerPeriodic!.cancel();
    }
    gameState.isReplay = true;
    gameState.reset();
    replay(gameState.cardInfo, gameState.constantsData, 0);
  }

  // async restart(): Promise<void> {
  //   this.stop();
  //   await new Promise((resolve) => {
  //       const waitForPreviousReplayCompleted = () => {
  //           if (!this.isReplaying) {
  //               resolve(true);
  //           } else {
  //               setTimeout(waitForPreviousReplayCompleted, TIMER_INTERVAL);
  //           }
  //       };
  //       waitForPreviousReplayCompleted();
  //   });
  //   this.replay();
  // }

  Future<void> changeTime(int newTime) async {
    GameState gameState = GameState();
    stop();

    Completer<bool> completer = Completer<bool>();

    void waitForPreviousReplayCompleted() {
      if (!gameState.isReplay) {
        completer.complete(true);
      } else {
        Future.delayed(
            Duration(milliseconds: 10), waitForPreviousReplayCompleted);
      }
    }

    waitForPreviousReplayCompleted();
    await completer.future;
    if (gameState.timerPeriodic != null) {
      gameState.timerPeriodic!.cancel();
    }
    gameState.isReplay = true;
    gameState.reset();

    currentTime = newTime;
    shownTime = currentTime;

    int startFlash = 0;
    int publicTime = 0;
    int lastIndex = 0;

    await gameState.videoReplaySetup(
        gameState.cardInfo, gameState.constantsData);

    for (int i = 0; i < events.length - 1; i++) {
      lastIndex = i;
      switch (events[i].method) {
        case 'handleSuccess':
          gameState
              .showClickedDifferenceWithoutIndexOrFlash(events[i].params![0]);
          break;
        case 'startFlash':
          startFlash++;
          break;
        case 'stopFlash':
          startFlash--;
          break;
        case 'updateTime':
          publicTime = events[i].params![0];
          break;
        case 'start':
          gameState.setPlayerService(events[i].params![0]);
          break;
        case 'startGame':
          gameState.enterGame(events[i].params![0]);
          break;
        case 'handleWinner':
          gameState.handleWinner(events[i].params![0]);
          break;
        case 'handleEndGame':
          gameState.handleEndGame(events[i].params![0]);
          break;
        case 'toggleFlash':
          startFlash++;
          break;
        default:
      }

      if (i + 1 < events.length && events[i + 1].timestamp > currentTime) {
        i = events.length - 1;
      }
    }

    if (startFlash % 2 == 1) {
      gameState.toggleFlashMode();
    }

    gameState.getTimerService.updateTime(publicTime);

    replay(gameState.cardInfo, gameState.constantsData, lastIndex);
  }

  void replay(GameCardInfo gameCardInfo, GameConstantsData gameConstants,
      int startIndex) async {
    GameState gameState = GameState();
    if (startIndex == 0) {
      await gameState.videoReplaySetup(gameCardInfo, gameConstants);
    }
    for (GameEvent gameEvent in events.sublist(startIndex)) {
      await executeGameEvent(gameEvent);
      if (isAborted) {
        break;
      }
    }

    gameState.isReplay = false;
    stop();
    resetVideoReplay();
  }

  void resetVideoReplay() {
    isPaused = false;
    speed = 1;
    currentTime = 0;
    shownTime = 0;
    isAborted = false;
    notifyListeners();
  }

  void setSpeed(int newSpeed) {
    speed = newSpeed;
  }

  void stop() {
    isAborted = true;
  }

  void play() {
    isPaused = false;
    notifyListeners();
  }

  void pause() {
    isPaused = true;
    notifyListeners();
  }

  void selectFunction(GameEvent event) {
    switch (event.method) {
      case 'start':
        GameState gameState = GameState();
        gameState.enterGame(event.params![0]);
        break;
      case 'startGame':
        GameState gameState = GameState();
        gameState.enterGame(event.params![0]);
        break;
      case 'handleSuccess':
        GameState gameState = GameState();
        gameState.handleSuccess(event.params![0]);
        break;
      case 'handleError':
        GameState gameState = GameState();
        gameState.handleError();
        break;
      case 'updateTime':
        GameState gameState = GameState();
        gameState.getTimerService.updateTime(event.params![0]);
        break;
      case 'handleWinner':
        GameState gameState = GameState();
        gameState.handleWinner(event.params![0]);
        break;
      case 'handleEndGame':
        GameState gameState = GameState();
        gameState.handleEndGame(event.params![0]);
        break;
      case 'startFlash':
        GameState gameState = GameState();
        gameState.toggleFlashMode();
        break;
      case 'stopFlash':
        GameState gameState = GameState();
        gameState.toggleFlashMode();
        break;
      case 'toggleFlash':
        GameState gameState = GameState();
        gameState.toggleFlashMode();
        break;
      default:
    }
  }
}
