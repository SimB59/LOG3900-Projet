import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/sliding-button-language.dart';
import 'package:namer_app/common-widgets/sliding-button-theme.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/http-constants.dart';
import 'package:provider/provider.dart';

import '../common-widgets/button-style.dart';
import '../common-widgets/chat-button.dart';
import '../common-widgets/gradient-background.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<HomePage> {
  bool isButtonOnRight = false;

  @override
  void initState() {
    super.initState();
    getAccount();
  }

  Future<void> getAccount() async {
    var responseForAccount =
        await getRequest('account/${AccountService.accountPseudo}');
    if (responseForAccount != null) {
      var responseData = json.decode(responseForAccount.body);
      var responseDataAccount =
          AccountData.fromJson(json.decode(responseData['body']));
      AccountService.rank = responseDataAccount.accountRank;
      AccountService.level = responseDataAccount.accountLevel;
      ThemeState themeState = ThemeState();
      themeState.setTheme(responseDataAccount.theme);
      TranslationState translationState = TranslationState();
      translationState.setLanguage(responseDataAccount.language);
    }
  }

  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    GameState gameState = GameState();
    gameState.resetAtHomePage();
    return Scaffold(
      body: Container(
        decoration: gradientBackground(themeState),
        child: Stack(
          children: [
            Center(
              child: Column(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        SizedBox(
                          width: 600,
                          child: Image(
                              image: AssetImage(
                                  'assets/images/${themeState.currentTheme['logo']}.png'),
                              fit: BoxFit.contain),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            const SizedBox(height: 7),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/options',
                                    arguments: {
                                      'firstMode': FirstGameMode.CLASSIC.value,
                                    });
                              },
                              style: buttonStyle(themeState),
                              child: Text(
                                translationState.currentLanguage['Classic']!,
                              ),
                            ),
                            const SizedBox(height: 3),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/options',
                                    arguments: {
                                      'firstMode':
                                          FirstGameMode.LIMITED_TIME.value,
                                    });
                              },
                              style: buttonStyle(themeState),
                              child: Text(
                                translationState
                                    .currentLanguage['Limited Time']!,
                              ),
                            ),
                            const SizedBox(height: 3),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/options',
                                    arguments: {
                                      'firstMode': FirstGameMode.REFLEX.value,
                                    });
                              },
                              style: buttonStyle(themeState),
                              child: Text(
                                translationState.currentLanguage['Reflex']!,
                              ),
                            ),
                            const SizedBox(height: 3),
                            ElevatedButton(
                              onPressed: () async {
                                Navigator.pushNamed(context, '/observer');
                              },
                              style: buttonStyle(themeState),
                              child: Text(
                                translationState.currentLanguage['Observer']!,
                              ),
                            ),
                            const SizedBox(height: 3),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/video');
                              },
                              style: buttonStyle(themeState),
                              child: Text(
                                translationState
                                    .currentLanguage['Video replay']!,
                              ),
                            ),
                            const SizedBox(height: 3),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/profile');
                              },
                              style: buttonStyle(themeState),
                              child: Text(
                                translationState.currentLanguage['Profile']!,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SafeArea(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Text(
                          'Simon Bachand, ',
                          style: TextStyle(
                              color:
                                  themeState.currentTheme['Button foreground']),
                        ),
                        const Text('Mounir Lammali, ',
                            style: TextStyle(color: Colors.white)),
                        Text(
                          'Sidney Gharib, ',
                          style: TextStyle(
                              color:
                                  themeState.currentTheme['Button foreground']),
                        ),
                        const Text('Antoine Soldati, ',
                            style: TextStyle(color: Colors.white)),
                        Text(
                          'Olivier Falardeau, ',
                          style: TextStyle(
                              color:
                                  themeState.currentTheme['Button foreground']),
                        ),
                        const Text('Jérome Chabot ',
                            style: TextStyle(color: Colors.white)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 20,
              right: 20,
              child: SlidingButtonLanguage(translationState: translationState),
            ),
            Positioned(
              top: 20,
              right: 120,
              child: SlidingButtonTheme(themeState: themeState),
            ),
            Positioned(
              top: 20,
              right: 220,
              child: ElevatedButton(
                onPressed: () async {
                  var logger = Logger();
                  http.Response response = await logout();
                  logger.d(response.statusCode);
                  debugPrint(response.statusCode.toString());
                  if (response.statusCode == httpStatusOk) {
                    Navigator.pushNamed(context, '/login');
                  }
                  Navigator.pushNamed(context, '/login');
                },
                style: logoutButtonStyle(themeState),
                child: Text(
                  translationState.currentLanguage['Log out']!,
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: chatButton(context),
    );
  }
}
