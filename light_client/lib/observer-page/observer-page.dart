import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/chat-button.dart';
import 'package:namer_app/common-widgets/gradient-background.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/card-stats.dart';
import 'package:namer_app/general-classes/coordinate.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/general-classes/player.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/observer-page/observer-service.dart';
import 'package:namer_app/observer-page/observer_game.dart';
import 'package:provider/provider.dart';

class ObserverPage extends StatefulWidget {
  const ObserverPage({super.key});

  @override
  State<ObserverPage> createState() => _ObserverPageState();
}

class _ObserverPageState extends State<ObserverPage> {
  Future<void> _joinGameAsObserver(BuildContext context, ObserverGame game,
      Map<String, ObserverGame> gamesMap) async {
    String? associatedKey;
    List<String> players = [];
    gamesMap.forEach((key, value) {
      if (value == game) {
        associatedKey = key;
        players = value.players;
      }
    });

    FirstGameMode mode;
    if (game.roomName.contains("classique")) {
      mode = FirstGameMode.CLASSIC;
    } else if (game.roomName.contains('reflex')) {
      mode = FirstGameMode.REFLEX;
    } else {
      mode = FirstGameMode.LIMITED_TIME;
    }

    GameState gameState = GameState();
    gameState.playerService.opponents = [];
    gameState.playerService.self =
        Player(pseudo: AccountService.accountPseudo, differenceCount: 0);
    // for (String pseudo in players) {
    //   gameState.playerService.opponents
    //       .add(Player(pseudo: pseudo, differenceCount: 0));
    // }
    gameState.observerGame = game;
    gameState.handleSocket();
    gameState.socket.send('addObserver', game.roomName);

    Game initializedGame = Game(
        id: associatedKey!,
        gameTitle: game.roomName,
        firstMode: mode,
        difficulty: "easy");
    gameState.game = initializedGame;
    ThemeState themeState = ThemeState();
    TranslationState translationState = TranslationState();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        '${translationState.currentLanguage['Joining']} ${game.roomName} ${translationState.currentLanguage['as observer...']}',
        style: TextStyle(color: themeState.currentTheme['Button foreground']),
      ),
    ));

    if (!(gameState.game.firstMode == FirstGameMode.LIMITED_TIME)) {
      var cardId = associatedKey!;
      String route = 'card/$cardId';
      var response = await getRequest(route);
      if (response != null) {
        var responseData = json.decode(response.body);
        var responseDataCard = json.decode(responseData['body']);
        var cardInfoGet = GameCardInfo(
          enlargementRadius: responseDataCard['enlargementRadius'],
          differences:
              coordinateListListFromJson(responseDataCard['differences']),
          title: game.roomName,
          stats: CardStats(
            classical: FirstModeStats(
              solo: [],
              versus: [],
            ),
          ),
          difficultyLevel: "hardcoded",
          id: associatedKey!,
        );
        gameState.cardInfo = cardInfoGet;
      }
      await gameState.setGameDifferences();
      await gameState.setMainImages(gameState.game.id);

      for (List<Coordinate> difference in gameState.alreadyFoundDifferences) {
        var index = gameState.getDifferenceIndex(difference[0]);
        gameState.activeFilters.add(gameState.allFilters[index]);
      }
    }

    var playerData = players.map((player) {
      return {"pseudo": player, "socketId": "hardcoded"};
    }).toList();
    var jsonEncodedPlayers = jsonEncode(playerData);

    gameState.enterGameAsObserver(
        context, jsonEncodedPlayers, associatedKey!, mode);
  }

  @override
  Widget build(BuildContext context) {
    ObserverService observerService = context.watch<ObserverService>();
    context.watch<LobbyState>();
    context.watch<GameState>();
    Map<String, ObserverGame> gamesMap = observerService.getGamesMap();
    List<ObserverGame> games = observerService.getGames();
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: themeState.currentTheme['Background app bar'],
        title: Text(
          translationState.currentLanguage['Observer page']!,
          style: TextStyle(color: themeState.currentTheme['Button foreground']),
        ),
      ),
      body: Container(
        decoration: gradientBackground(themeState),
        child: ListView.builder(
          itemCount: games.length,
          itemBuilder: (BuildContext context, int index) {
            ObserverGame game = games[index];
            return Card(
              margin: const EdgeInsets.all(8.0),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  children: [
                    ListTile(
                      title: Text(
                        game.roomName,
                        style: TextStyle(
                            color:
                                themeState.currentTheme['Button foreground']),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Text(
                            '${translationState.currentLanguage['Player(s) in game']!}: ${game.playerCount}',
                            style: TextStyle(
                                color: themeState
                                    .currentTheme['Button foreground']),
                          ),
                          const SizedBox(height: 2),
                          // Text('Players: ${game.players.join(', ')}'),
                          // SizedBox(height: 4),
                          Text(
                            '${translationState.currentLanguage['Observer(s) currently spectating']!}: ${game.observerCount}',
                            style: TextStyle(
                                color: themeState
                                    .currentTheme['Button foreground']),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () =>
                              _joinGameAsObserver(context, game, gamesMap),
                          child: Text(
                            translationState
                                .currentLanguage['Join as observer']!,
                            style: TextStyle(
                                color: themeState
                                    .currentTheme['Button foreground']),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
      floatingActionButton: chatButton(context),
    );
  }
}
