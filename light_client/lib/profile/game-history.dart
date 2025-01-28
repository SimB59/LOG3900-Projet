import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/general-classes/game-history.dart';
import 'package:provider/provider.dart';

class GameHistoryListItem extends StatelessWidget {
  final GameHistoryData gameHistoryInstance;

  const GameHistoryListItem({super.key, required this.gameHistoryInstance});

  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    return Container(
      decoration: BoxDecoration(
        border: Border.all(
          color: Colors.grey.withOpacity(0.5),
          width: 1.0,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: ListTile(
        title: Text(
          (gameHistoryInstance.isWinner)
              ? translationState.currentLanguage['Winner']!
              : translationState.currentLanguage['Loser']!,
          style: TextStyle(color: themeState.currentTheme['Button foreground']),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${translationState.currentLanguage['Game type']!}: ${translationState.currentLanguage[gameHistoryInstance.firstMode]}   ',
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
            Text(
              'Date: ${gameHistoryInstance.date}   ',
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
            Text(
              '${translationState.currentLanguage['Time']!}: ${gameHistoryInstance.time}',
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
          ],
        ),
      ),
    );
  }
}
