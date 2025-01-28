import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/general-classes/activity-data.dart';
import 'package:provider/provider.dart';

class ActivityListItem extends StatelessWidget {
  final ActivityData activityInstance;

  const ActivityListItem({super.key, required this.activityInstance});

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
        title: Text(translationState.currentLanguage[activityInstance.connectionType]!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Date: ${activityInstance.date}   ', style: TextStyle(color: themeState.currentTheme['Button foreground']),),
            Text(
              '${translationState.currentLanguage['Time']!}: ${activityInstance.time}',
              style: TextStyle(color: themeState.currentTheme['Button foreground']),
            ),
          ],
        ),
      ),
    );
  }
}
