import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/general-classes/lobby-type.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:provider/provider.dart';

class LobbyCreateDialog extends StatefulWidget {
  final GameCardInfo cardInfo;
  final FirstGameMode firstGameMode;

  const LobbyCreateDialog({
    super.key,
    required this.cardInfo,
    required this.firstGameMode,
  });

  @override
  State<LobbyCreateDialog> createState() => _LobbyCreateDialogState();
}

class _LobbyCreateDialogState extends State<LobbyCreateDialog> {
  late LobbyState lobbyState;
  late GameState gameState;

  void createLobby(LobbyType lobbyType) {
    Game game = Game(
        id: widget.cardInfo.id,
        gameTitle: widget.cardInfo.title,
        firstMode: widget.firstGameMode,
        difficulty: widget.cardInfo.difficultyLevel);

    gameState.game = game;
    gameState.cardInfo = widget.cardInfo;
    lobbyState.enterLobby(true, widget.firstGameMode.value);

    lobbyState.lastUsedCard = widget.cardInfo;
    lobbyState.lobbyType = lobbyType;
    Navigator.of(context).pop();
    Navigator.pushNamed(context, '/lobby', arguments: {
      'cardId': widget.cardInfo.id,
      'firstMode': widget.firstGameMode.value,
    });
  }

  @override
  Widget build(BuildContext context) {
    lobbyState = context.watch<LobbyState>();
    gameState = context.watch<GameState>();
    var themeState = context.watch<ThemeState>();
    var translationState = context.watch<TranslationState>();

    return Container(
      // decoration: const BoxDecoration(
      //   color: Colors.white,
      // ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Text(
            translationState.currentLanguage['Create a game']!,
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: ElevatedButton(
              onPressed: () => {createLobby(LobbyType.PUBLIC)},
              style: buttonStyle(themeState),
              child: Text(
                translationState.currentLanguage['Public']!,
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
              ),
            ),
          ),
        ],
      ),
    );
  }
}
