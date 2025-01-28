import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/general-classes/message.dart';
import 'package:provider/provider.dart';

class SlidingButtonLanguage extends StatefulWidget {
  const SlidingButtonLanguage({Key? key, required this.translationState}) : super(key: key);
  final TranslationState translationState;

  @override
  _SlidingButtonLanguageState createState() => _SlidingButtonLanguageState();
}

class _SlidingButtonLanguageState extends State<SlidingButtonLanguage> {
  bool _isOnFr = false;

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    return GestureDetector(
      onTap: () {
        setState(() {
          _isOnFr = !_isOnFr;
        });

        if (widget.translationState.currentLanguageString != 'fr'){ 
          widget.translationState.setLanguage('fr'); 
        } else{
          widget.translationState.setLanguage('en');
        }
        if (AccountService.accountUserId != ''){
          Map<String, dynamic> pseudoBody = {
            'userId': AccountService.accountUserId,
            'language': widget.translationState.currentLanguageString,
            'theme': themeState.currentThemeString,
          };
          postRequest('account/preferences', Message(title: 'updatePreferences', body: jsonEncode(pseudoBody)));
        }

      },
      child: Container(
        width: 80,
        height: 40,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: themeState.currentTheme['Sliding button background'],
        ),
        child: Stack(
          children: [
            Positioned(
              left: -7,
              top: 0,
              bottom: 0,
              width: 50,
              child: Center(
                //TODO ?
                child: Text(
                  'En',
                  style: TextStyle(
                    color: (widget.translationState.currentLanguageString == 'fr') ? Colors.white : Colors.white,
                  ),
                ),
              ),
            ),
            Positioned(
              right: -7,
              top: 0,
              bottom: 0,
              width: 50,
              child: Center(
                child: Text(
                  'Fr',
                  style: TextStyle(
                    color: (widget.translationState.currentLanguageString == 'fr') ? Colors.white : Colors.white,
                  ),
                ),
              ),
            ),
            AnimatedPositioned(
              duration: const Duration(milliseconds: 300),
              left: (widget.translationState.currentLanguageString == 'fr') ? 40 : 0,
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: themeState.currentTheme['Sliding button circle'],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}