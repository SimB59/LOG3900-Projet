import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/game-chat/game-chat-dialog.dart';
import 'package:namer_app/game-chat/game-chat-state.dart';
import 'package:namer_app/game-constants/game-constants.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/lobby-io.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class LobbyPage extends StatefulWidget {
  const LobbyPage({super.key});

  @override
  State<LobbyPage> createState() => _LobbyPageState();
}

class _LobbyPageState extends State<LobbyPage> {
  late CardsState cardState;
  late List<String> playerPseudos = [];
  late GameState gameState;

  late LobbyState lobbyState;
  late TranslationState translationState;
  late ThemeState themeState;
  late GameCardInfo cardInfo;
  late Future<List<String>> playersInLobby;
  bool isInitialization = true;
  late FirstGameMode firstGameMode;
  late String cardId;

  @override
  void initState() {
    super.initState();
  }

  void abandonLobby() {
    LobbyIO lobbyIO = LobbyIO(
        cardId: gameState.game.id,
        playerName: AccountService.accountPseudo,
        playerId: gameState.socket.gameSocket.id,
        lobbyId: lobbyState.lobbyId,
        lobbyType: lobbyState.lobbyType);
    gameState.socket.send('joinRequestAborted', jsonEncode(lobbyIO.toJson()));
    lobbyState.isInLobby = false;
    GameChatState gameChat = GameChatState();
    gameChat.clearMessageHistory();

    Navigator.pushReplacementNamed(context, '/home');
  }

  @override
  Widget build(BuildContext context) {
    if (isInitialization) {
      lobbyState = context.watch<LobbyState>();
      gameState = context.watch<GameState>();
      cardState = context.watch<CardsState>();
      translationState = context.watch<TranslationState>();
      themeState = context.watch<ThemeState>();
      Map<String, dynamic>? args =
          ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;

      cardId = args?['cardId'] ?? '';
      String firstModeString = args?['firstMode'] ?? '';
      firstGameMode = FirstGameModeExtension.fromString(firstModeString);

      if (firstGameMode != FirstGameMode.LIMITED_TIME) {
        cardInfo = cardState.getCardById(cardId);
      }

      isInitialization = false;
    }

    playersInLobby = lobbyState.getPlayersAsync(cardId);

    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Container(
        decoration: gradientBackground(themeState),
        child: Stack(
          children: <Widget>[
            Center(
              child: FutureBuilder<List<String>>(
                  future: playersInLobby,
                  builder: (context, snapshot) {
                    if (snapshot.hasData && snapshot.data! != []) {
                      return SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: <Widget>[
                            Text(
                              translationState.currentLanguage['Lobby']!,
                              style: TextStyle(
                                fontSize: 20,
                                color: themeState
                                    .currentTheme['Button foreground'],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Builder(builder: (context) {
                              if (firstGameMode == FirstGameMode.CLASSIC) {
                                return Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: <Widget>[
                                    Column(
                                      children: <Widget>[
                                        Text(
                                          cardInfo.title,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: themeState.currentTheme[
                                                'Button foreground'],
                                            fontSize: 30,
                                          ),
                                        ),
                                        SizedBox(
                                          height: 200,
                                          child: Image(
                                            fit: BoxFit.contain,
                                            image: NetworkImage(
                                              '${getServerUrlApi()}/image/${cardInfo.id}_original',
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 10),
                                    Column(
                                      children: <Widget>[
                                        Text(
                                          '${translationState.currentLanguage['Difference count']!} : ${cardInfo.differences.length}',
                                          style: TextStyle(
                                            color: themeState.currentTheme[
                                                'Button foreground'],
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                );
                              } else {
                                return Container();
                              }
                            }),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: <Widget>[
                                Text(
                                  translationState.currentLanguage['Players']!,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: themeState
                                        .currentTheme['Button foreground'],
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  translationState
                                      .currentLanguage['Player list']!,
                                  style: TextStyle(
                                    color: themeState
                                        .currentTheme['Button foreground'],
                                    fontSize: 10,
                                  ),
                                ),
                                SizedBox(
                                  height: 150,
                                  child: ListView.builder(
                                    itemCount: lobbyState
                                                    .playersLobby[cardId] ==
                                                null ||
                                            lobbyState.playersLobby[cardId]![
                                                    lobbyState.lobbyId] ==
                                                null
                                        ? 0
                                        : lobbyState.getPlayers(cardId).length,
                                    itemBuilder:
                                        (BuildContext context, int index) {
                                      return Padding(
                                        padding: const EdgeInsets.fromLTRB(
                                            0, 10, 0, 0),
                                        child: Center(
                                          child: Text(
                                            lobbyState
                                                .getPlayers(cardId)[index],
                                            style: TextStyle(
                                                color: themeState.currentTheme[
                                                    'Button foreground']),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                            Visibility(
                              visible: lobbyState.isGameCreator,
                              child: ElevatedButton(
                                style: disableableButtonStyle(
                                    themeState,
                                    (lobbyState.getPlayers(cardId).length > 1 &&
                                            lobbyState.isGameCreator) &&
                                        !lobbyState
                                            .constantsContainUnconfirmedChanges),
                                onPressed: () {
                                  if (lobbyState.getPlayers(cardId).length >
                                          1 &&
                                      lobbyState.isGameCreator) {
                                    lobbyState.startGame(cardId, firstGameMode,
                                        gameState.constantsData);
                                  }
                                },
                                child: Text(
                                    translationState.currentLanguage['Start']!),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(80, 10, 80, 0),
                              child: GameConstants(
                                firstGameMode: firstGameMode,
                              ),
                            ),
                          ],
                        ),
                      );
                    } else {
                      return const Center(child: CircularProgressIndicator());
                    }
                  }),
            ),
          ],
        ),
      ),
      floatingActionButton: Stack(
        children: <Widget>[
          Positioned(
            top: 25,
            left: 25,
            child: ElevatedButton(
              style: homeButtonStyle(themeState),
              onPressed: () {
                abandonLobby();
              },
              child: const FittedBox(
                fit: BoxFit.fitWidth,
                child: Icon(Icons.home),
              ),
            ),
          ),
          Positioned(
            bottom: 10,
            right: 10,
            child: FloatingActionButton(
              heroTag: 'gameChatButton',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return GameChatDialog();
                  },
                );
              },
              child: Icon(
                Icons.chat,
                color: themeState.currentTheme['Button foreground'],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
