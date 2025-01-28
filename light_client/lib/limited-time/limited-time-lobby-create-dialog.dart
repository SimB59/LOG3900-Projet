import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/general-classes/lobby-type.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:provider/provider.dart';

class LimitedTimeLobbyCreateDialog extends StatefulWidget {
  const LimitedTimeLobbyCreateDialog({super.key});

  @override
  State<LimitedTimeLobbyCreateDialog> createState() =>
      _LimitedTimeLobbyCreateDialogState();
}

class _LimitedTimeLobbyCreateDialogState
    extends State<LimitedTimeLobbyCreateDialog> {
  late LobbyState lobbyState;
  late GameState gameState;

  void createLobby(LobbyType lobbyType) {
    Game game = Game(
        id: 'Limited',
        gameTitle: 'Limited',
        firstMode: FirstGameMode.LIMITED_TIME,
        difficulty: 'Limited');

    gameState.game = game;
    lobbyState.enterLimitedTimeLobby(true);
    lobbyState.lobbyType = lobbyType;
    Navigator.of(context).pop();
    Navigator.pushNamed(context, '/lobby', arguments: {
      'cardId': 'Limited',
      'firstMode': FirstGameMode.LIMITED_TIME.value,
    });
  }

  @override
  Widget build(BuildContext context) {
    lobbyState = context.watch<LobbyState>();
    gameState = context.watch<GameState>();
    var themeState = context.watch<ThemeState>();
    var translationState = context.watch<TranslationState>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Text(
          translationState.currentLanguage['Create a game']!,
          style: TextStyle(color: themeState.currentTheme['Button foreground']),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: ElevatedButton(
            onPressed: () => {createLobby(LobbyType.PUBLIC)},
            style: buttonStyle(themeState),
            child: Text(
              translationState.currentLanguage['Public']!,
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: ElevatedButton(
            onPressed: () => {createLobby(LobbyType.FRIENDS)},
            style: buttonStyle(themeState),
            child: Text(
              translationState.currentLanguage['Friends']!,
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: ElevatedButton(
            onPressed: () => {createLobby(LobbyType.FRIENDS_OF_FRIENDS)},
            style: buttonStyle(themeState),
            child: Text(
              translationState.currentLanguage['Friends of friends']!,
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
          ),
        ),
      ],
    );
  }
}
