import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/video-replay/video-replay-state.dart';
import 'package:provider/provider.dart';

class EndGameDialog extends StatefulWidget {
  @override
  State<EndGameDialog> createState() => _EndGameDialogState();
}

class _EndGameDialogState extends State<EndGameDialog> {
  @override
  Widget build(BuildContext context) {
    var gameState = context.watch<GameState>();
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    var videoReplayState = context.watch<VideoReplayState>();

    String message = '';
    if (videoReplayState.isVideoReplayDialog) {
      message = 'Replay video';
    } else if (gameState.isObserver) {
      message = translationState.currentLanguage['The game has ended']!;
    } else if (gameState.gameLimitedIsQuit) {
      message = translationState.currentLanguage['Your partner quit!']!;
    } else if (gameState.isWinner) {
      message = translationState.currentLanguage['VICTORY! You won']!;
    } else {
      message = translationState.currentLanguage['DEFEAT! You lost']!;
    }

    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Text(
            message,
            style: const TextStyle(
              color: Color.fromRGBO(63, 81, 181, 1),
              fontWeight: FontWeight.w500,
              fontSize: 24,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: <Widget>[
              ElevatedButton(
                style: buttonStyle(themeState),
                onPressed: () {
                  videoReplayState.events = [];
                  videoReplayState.changeIsReplayButtonActive(true);
                  videoReplayState.isVideoReplayDialog = false;
                  Navigator.of(context).pop();
                  gameState.abandonGame(false);
                },
                child: Text(
                  translationState.currentLanguage['Leave']!,
                ),
              ),
              Visibility(
                visible: (gameState.game.firstMode == FirstGameMode.CLASSIC),
                child: ElevatedButton(
                  style: buttonStyle(themeState),
                  onPressed: () => {
                    Navigator.of(context).pop(),
                    gameState.isReplay = true,
                    videoReplayState.isVideoReplayDialog = true,
                    gameState.reset(),
                    videoReplayState.replay(
                        gameState.cardInfo, gameState.constantsData, 0),
                  },
                  child: Text(
                      translationState.currentLanguage['Replay the game']!),
                ),
              ),
              Visibility(
                visible: (gameState.game.firstMode == FirstGameMode.CLASSIC),
                child: ElevatedButton(
                  style: videoReplayState.isReplayButtonActive
                      ? buttonStyle(themeState)
                      : buttonStyle(themeState).copyWith(
                          backgroundColor:
                              MaterialStateProperty.all(Colors.grey),
                        ),
                  onPressed: videoReplayState.isReplayButtonActive
                      ? () {
                          videoReplayState.saveReplay(
                              gameState.cardInfo.id,
                              gameState.cardInfo.title,
                              gameState.constantsData,
                              gameState.playerService.opponents
                                  .map((player) => player.pseudo)
                                  .toList());
                          videoReplayState.changeIsReplayButtonActive(false);
                        }
                      : null,
                  child: Text(translationState.currentLanguage['Save replay']!),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
