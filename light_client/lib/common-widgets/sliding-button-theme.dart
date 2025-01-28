import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/general-classes/message.dart';
import 'package:provider/provider.dart';

class SlidingButtonTheme extends StatefulWidget {
  const SlidingButtonTheme({Key? key, required this.themeState}) : super(key: key);
  final ThemeState themeState;

  @override
  _SlidingButtonThemeState createState() => _SlidingButtonThemeState();
}

class _SlidingButtonThemeState extends State<SlidingButtonTheme> {
  bool _isOnDark = false;
  @override
  Widget build(BuildContext context) {
    TranslationState translationState = context.watch<TranslationState>();
    return GestureDetector(
      onTap: () {
        setState(() {
          _isOnDark = !_isOnDark;
        });
        ((widget.themeState.currentThemeString == 'light'))? widget.themeState.setTheme('dark') : widget.themeState.setTheme('light');
        
        if (AccountService.accountUserId != ''){
          Map<String, dynamic> pseudoBody = {
          'userId': AccountService.accountUserId,
          'language': translationState.currentLanguageString,
          'theme': widget.themeState.currentThemeString,
          };
          postRequest('account/preferences', Message(title: 'updatePreferences', body: jsonEncode(pseudoBody)));
        }
      },
      child: Container(
        width: 80,
        height: 40,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: widget.themeState.currentTheme['Sliding button background'],
        ),
        child: Stack(
          children: [
            const Positioned(
              left: -7,
              top: 0,
              bottom: 0,
              width: 50,
              child: Center(
                child: Icon(Icons.light_mode, color: Colors.white,)
              ),
            ),
            const Positioned(
              right: -7,
              top: 0,
              bottom: 0,
              width: 50,
              child: Center(
                child: Icon(Icons.mode_night, color: Colors.white)
              ),
            ),
            AnimatedPositioned(
              duration: const Duration(milliseconds: 300),
              left: (widget.themeState.currentThemeString == 'dark') ? 40 : 0,
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.themeState.currentTheme['Sliding button circle'],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}