import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/general-classes/lobby.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:provider/provider.dart';

class LimitedTimeGameCard extends StatefulWidget {
  final MapEntry<String, Lobby> lobbyInformation;
  const LimitedTimeGameCard({super.key, required this.lobbyInformation});

  @override
  State<LimitedTimeGameCard> createState() => _LimitedTimeGameCardState();
}

class _LimitedTimeGameCardState extends State<LimitedTimeGameCard> {
  late LobbyState lobbyState;
  late GameState gameState;
  late TranslationState translationState;
  late ThemeState themeState;

  void joinGameLimited() {
    Game game = Game(
      id: 'Limited',
      gameTitle: 'Limited',
      firstMode: FirstGameMode.LIMITED_TIME,
      difficulty: 'Limited',
    );

    gameState.game = game;
    lobbyState.enterLimitedTimeLobby(false, widget.lobbyInformation.key);
    Navigator.of(context).pop();
    Navigator.pushNamed(context, '/lobby', arguments: {
      'cardId': 'Limited',
      'firstMode': FirstGameMode.LIMITED_TIME.value,
    });
  }

  @override
  Widget build(BuildContext context) {
    gameState = context.watch<GameState>();
    lobbyState = context.watch<LobbyState>();
    translationState = context.watch<TranslationState>();
    themeState = context.watch<ThemeState>();

    List<String> playersInLobby = lobbyState
        .playersLobby['Limited']![widget.lobbyInformation.key]!.players;
    bool isJoinButtonEnabled = playersInLobby.length < 4;

    return Container(
      decoration: BoxDecoration(
        color: const Color.fromRGBO(255, 255, 255, 0),
        border: Border.all(
          style: BorderStyle.solid,
          color: Colors.white,
          width: 2,
        ),
      ),
      child: Column(
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: <Widget>[
              Column(
                children: <Widget>[
                  Text(
                    translationState.currentLanguage['Player list']!,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: themeState.currentTheme['Button foreground'],
                      fontSize: 20,
                    ),
                  ),
                  SizedBox(
                    height: 175,
                    width: 400,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemCount: widget.lobbyInformation.value.players.length,
                      itemBuilder: (BuildContext context, int index) {
                        return Center(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 7),
                            child: Text(
                              widget.lobbyInformation.value.players[index],
                              style: TextStyle(
                                color: themeState.currentTheme['Button foreground'],
                                fontSize: 20,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
          ElevatedButton(
            onPressed: () => {if (isJoinButtonEnabled) joinGameLimited()},
            style: disableableButtonStyle(themeState, isJoinButtonEnabled),
            child: Text(
              translationState.currentLanguage['Join']!,
            ),
          ),
        ],
      ),
    );
  }
}
