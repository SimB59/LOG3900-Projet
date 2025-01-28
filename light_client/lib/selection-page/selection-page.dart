import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/common-widgets/chat-button.dart';
import 'package:namer_app/game-card/game-card.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/lobby.dart';
import 'package:namer_app/limited-time/limited-time-game-card.dart';
import 'package:namer_app/limited-time/limited-time-lobby-create-dialog.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class SelectionPage extends StatefulWidget {
  const SelectionPage({super.key});

  @override
  State<SelectionPage> createState() => _SelectionPageState();
}

class _SelectionPageState extends State<SelectionPage> {
  late FirstGameMode _firstGameMode;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var cardsState = context.watch<CardsState>();
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    LobbyState lobbyState = context.watch<LobbyState>();

    Map<String, dynamic>? args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
    String firstModeString = args?['firstMode'] ?? '';
    _firstGameMode = FirstGameModeExtension.fromString(firstModeString);

    return Scaffold(
      body: Container(
        decoration: gradientBackground(themeState),
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Align(
                alignment: Alignment.topCenter,
                child: Text(
                  '${translationState.currentLanguage['Selection menu']!} - ${translationState.currentLanguage[_firstGameMode.displayValue]}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 40,
                  ),
                ),
              ),
            ),
            Builder(builder: (context) {
              if (cardsState.activeCardsData.isNotEmpty) {
                if (_firstGameMode == FirstGameMode.CLASSIC ||
                    _firstGameMode == FirstGameMode.REFLEX) {
                  return Expanded(
                    child: ListView.separated(
                      itemCount: cardsState.activeCardsData.length,
                      itemBuilder: (BuildContext context, int index) {
                        return Padding(
                          padding: const EdgeInsets.fromLTRB(30, 8, 30, 8),
                          child: GameCard(
                            cardInfo: cardsState.activeCardsData[index],
                            firstGameMode: _firstGameMode,
                          ),
                        );
                      },
                      separatorBuilder: (BuildContext context, int index) =>
                          const Divider(),
                    ),
                  );
                } else {
                  List<MapEntry<String, Lobby>> lobbies = lobbyState
                      .getJoinableLobbies('Limited', FirstGameMode.LIMITED_TIME)
                      .entries
                      .toList();
                  return Expanded(
                    child: Column(
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.all(10),
                          child: ElevatedButton(
                            onPressed: () => {
                              showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return AlertDialog(
                                    backgroundColor: themeState.currentTheme['Dialog Background'],
                                    content: SizedBox(
                                      height:
                                          MediaQuery.of(context).size.height /
                                              2,
                                      child:
                                          const LimitedTimeLobbyCreateDialog(),
                                    ),
                                  );
                                },
                              )
                            },
                            style: buttonStyle(themeState),
                            child: Text(
                              translationState.currentLanguage['Create Coop']!,
                            ),
                          ),
                        ),
                        Expanded(
                          child: ListView.separated(
                            itemCount: lobbies.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Padding(
                                padding:
                                    const EdgeInsets.fromLTRB(30, 8, 30, 8),
                                child: LimitedTimeGameCard(
                                  lobbyInformation: lobbies[index],
                                ),
                              );
                            },
                            separatorBuilder:
                                (BuildContext context, int index) =>
                                    const Divider(),
                          ),
                        ),
                      ],
                    ),
                  );
                }
              } else {
                return Expanded(
                  child: Center(
                    child: Text(
                      translationState
                          .currentLanguage['No cards available to play!']!,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: themeState.currentTheme['Button foreground'],
                        fontSize: 30,
                      ),
                    ),
                  ),
                );
              }
            }),
          ],
        ),
      ),
      floatingActionButton: Stack(
        children: <Widget>[
          Positioned(
            bottom: 10,
            right: 10,
            child: chatButton(context),
          ),
          Positioned(
            top: 25,
            left: 25,
            child: ElevatedButton(
              style: homeButtonStyle(themeState),
              onPressed: () {
                Navigator.pushNamed(context, '/home');
              },
              child: const FittedBox(
                fit: BoxFit.fitWidth,
                child: Icon(Icons.home),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
