import 'package:flutter/material.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/observer-page/observer_game.dart';

class ObserverService extends ChangeNotifier {
  List<ObserverGame> getGames() {
    LobbyState lobbyState = LobbyState();
    List<ObserverGame> gamesList = [];

    for (var entry in lobbyState.observerGames.entries) {
      gamesList.add(entry.value);
    }
    return gamesList;
  }

  Map<String, ObserverGame> getGamesMap() {
    LobbyState lobbyState = LobbyState();
    return lobbyState.observerGames;
  }
}
