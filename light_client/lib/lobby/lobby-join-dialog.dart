import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:provider/provider.dart';

class LobbyJoinDialog extends StatefulWidget {
  final String lobbyId;
  final GameCardInfo cardInfo;
  final FirstGameMode firstGameMode;

  const LobbyJoinDialog({
    super.key,
    required this.lobbyId,
    required this.cardInfo,
    required this.firstGameMode,
  });

  @override
  State<LobbyJoinDialog> createState() => _LobbyJoinDialogState();
}

class _LobbyJoinDialogState extends State<LobbyJoinDialog> {
  late LobbyState lobbyState;
  late GameState gameState;

  void joinGame(FirstGameMode firstGameMode) {
    Game game = Game(
        id: widget.cardInfo.id,
        gameTitle: widget.cardInfo.title,
        firstMode: firstGameMode,
        difficulty: widget.cardInfo.difficultyLevel);

    gameState.game = game;
    gameState.cardInfo = widget.cardInfo;
    lobbyState.enterLobby(false, firstGameMode.value, widget.lobbyId);
    lobbyState.lastUsedCard = widget.cardInfo;
    Navigator.of(context).pop();
    Navigator.pushNamed(context, '/lobby', arguments: {
      'cardId': widget.cardInfo.id,
      'firstMode': firstGameMode.value,
    });
  }

  @override
  Widget build(BuildContext context) {
    lobbyState = context.watch<LobbyState>();
    gameState = context.watch<GameState>();
    var themeState = context.watch<ThemeState>();
    var translationState = context.watch<TranslationState>();
    List<String> playersInLobby =
        lobbyState.playersLobby[widget.cardInfo.id]![widget.lobbyId]!.players;
    int maxNumberOfPlayers =
        widget.firstGameMode == FirstGameMode.REFLEX ? 2 : 4;
    bool isJoinButtonEnabled = playersInLobby.length < maxNumberOfPlayers;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Text(translationState.currentLanguage['Player list']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
        SizedBox(
          height: 250,
          width: 250,
          child: ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            itemCount: playersInLobby.length,
            itemBuilder: (BuildContext context, int index) {
              return Text(playersInLobby[index], style: TextStyle(color: themeState.currentTheme['Button foreground']),);
            },
          ),
        ),
        ElevatedButton(
          onPressed: () =>
              {if (isJoinButtonEnabled) joinGame(widget.firstGameMode)},
          style: isJoinButtonEnabled
              ? buttonStyle(themeState)
              : ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(
                    Colors.grey,
                  ),
                ),
          child: Text(
            translationState.currentLanguage['Join']!,
          ),
        ),
      ],
    );
  }
}
