import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/main.dart';

Future<void> showLogoutDialog() async {
  BuildContext context = MyApp.navigatorKey.currentState!.context;
  TranslationState translationState = TranslationState();
  ThemeState themeState = ThemeState();
  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      useRootNavigator: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(translationState.currentLanguage['Log out']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
          content: Text(
            translationState.currentLanguage['Logged out successfully']!,
            style: TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          actions: <Widget>[
            TextButton(
              child: Text(
                translationState.currentLanguage['Close']!,
                style: TextStyle(color: themeState.currentTheme['Button foreground']),
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            )
          ],
        );
      });
}
