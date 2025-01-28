import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/main.dart';
import 'package:provider/provider.dart';

Future<void> showBadPseudoDialog() async {
  BuildContext context = MyApp.navigatorKey.currentState!.context;
  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        var translationState = context.watch<TranslationState>();
        var themeState = context.watch<ThemeState>();
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Existing username']!,
          ),
          content: Text(
            translationState.currentLanguage[
                'This username is already in use by another account.']!,
          ),
          actions: <Widget>[
            TextButton(
              child: Text(
                translationState.currentLanguage['Close']!,
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            )
          ],
        );
      });
}

Future<void> showBadEmailDialog() async {
  BuildContext context = MyApp.navigatorKey.currentState!.context;
  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        var translationState = context.watch<TranslationState>();
        var themeState = context.watch<ThemeState>();
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Existing account']!,
          ),
          content: Text(
            translationState.currentLanguage[
                'This email is already in use by another account.']!,
          ),
          actions: <Widget>[
            TextButton(
              child: Text(
                translationState.currentLanguage['Close']!,
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
  return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        var translationState = context.watch<TranslationState>();
        var themeState = context.watch<ThemeState>();
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Internal error']!,
          ),
          content: Text(
            translationState
                .currentLanguage['An error occurred on the server.']!,
          ),
          actions: <Widget>[
            TextButton(
              child: Text(
                translationState.currentLanguage['Close']!,
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            )
          ],
        );
      });
}
