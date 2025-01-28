import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:provider/provider.dart';

class AbandonGameDialog extends StatefulWidget {
  const AbandonGameDialog({super.key});

  @override
  State<AbandonGameDialog> createState() => _AbandonGameDialogState();
}

class _AbandonGameDialogState extends State<AbandonGameDialog> {
  bool isInitialization = true;
  late GameState gameState;
  late TranslationState translationState;
  late ThemeState themeState;
  @override
  Widget build(BuildContext context) {
    if (isInitialization) {
      gameState = context.watch<GameState>();
      translationState = context.watch<TranslationState>();
      themeState = context.watch<ThemeState>();
      isInitialization = false;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Text(
          gameState.isObserver || gameState.isReplay
              ? translationState.currentLanguage['Close']!
              : translationState.currentLanguage['Give up game']!,
          style: const TextStyle(
            color: Color.fromRGBO(63, 81, 181, 1),
            fontWeight: FontWeight.w500,
            fontSize: 24,
          ),
        ),
        const SizedBox(height: 20),
        Text(
          gameState.isObserver || gameState.isReplay
              ? translationState.currentLanguage[
                  'Are you sure you want to return to main menu?']!
              : translationState.currentLanguage[
                  'Are you sure you want to give up the game and return to main menu?']!,
          style: TextStyle(color: themeState.currentTheme['Button foreground']),
        ),
        Row(
          children: <Widget>[
            ElevatedButton(
              style: buttonStyle(themeState),
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                translationState.currentLanguage['Back']!,
                style: TextStyle(
                    color: themeState.currentTheme['Button foreground']),
              ),
            ),
            ElevatedButton(
              style: buttonStyle(themeState),
              onPressed: () {
                Navigator.of(context).pop();
                gameState.abandonGame(true);
              },
              child: Text(
                translationState.currentLanguage['Confirm']!,
                style: TextStyle(
                    color: themeState.currentTheme['Button foreground']),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
