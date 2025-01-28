import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/main.dart';

String getTextFromController(TextEditingController controller) {
  return controller.text;
}

Future<void> showUnauthorizedDialog() async {
  BuildContext context = MyApp.navigatorKey.currentState!.context;
  TranslationState translationState = TranslationState();
  ThemeState themeState = ThemeState();

  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Not authorized']!,
            style: TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          content: Text(
            translationState.currentLanguage['Account already in use']!,
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

Future<void> showIncorrectLoginDialog() async {
  BuildContext context = MyApp.navigatorKey.currentState!.context;
  TranslationState translationState = TranslationState();
  ThemeState themeState = ThemeState();

  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Incorrect information']!,
            style: TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          content: Text(
            translationState.currentLanguage[
                'The provided information does not belong to an existing account.']!,
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

Future<void> showInternalServerErrorDialog() async {
  BuildContext context = MyApp.navigatorKey.currentState!.context;
  TranslationState translationState = TranslationState();
  ThemeState themeState = ThemeState();

  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Internal error']!,
            style: TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          content: Text(
            translationState
                .currentLanguage['An error occurred on the server.']!,
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
