import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/lobby/lobby-create-dialog.dart';
import 'package:namer_app/lobby/lobby-join-area.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:provider/provider.dart';

class GameCard extends StatefulWidget {
  const GameCard({
    super.key,
    required this.cardInfo,
    required this.firstGameMode,
  });
  final GameCardInfo cardInfo;
  final FirstGameMode firstGameMode;

  @override
  State<GameCard> createState() => _GameCardState();
}

class _GameCardState extends State<GameCard> {
  late LobbyState lobbyState;
  late GameState gameState;
  late CardsState cardsState;
  late TranslationState translationState;

  @override
  Widget build(BuildContext context) {
    gameState = context.watch<GameState>();
    cardsState = context.watch<CardsState>();
    lobbyState = context.watch<LobbyState>();
    translationState = context.watch<TranslationState>();

    var themeState = context.watch<ThemeState>();
    return Container(
      decoration: BoxDecoration(
        color: const Color.fromRGBO(255, 255, 255, 0),
        border: Border.all(
          style: BorderStyle.solid,
          color: Colors.white,
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Text(
                  widget.cardInfo.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 30,
                  ),
                ),
                Text(
                  '${translationState.currentLanguage['Difficulty']!} : ${widget.cardInfo.difficultyLevel}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 20,
                  ),
                )
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 0, 0, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                LobbyJoinArea(
                  cardInfo: widget.cardInfo,
                  firstGameMode: widget.firstGameMode,
                ),
                SizedBox(
                  height: 300,
                  child: Image(
                    fit: BoxFit.contain,
                    image: NetworkImage(
                        '${getServerUrlApi()}/image/${widget.cardInfo.id}_original'),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 0, 0, 20),
            child: ElevatedButton(
              onPressed: () => {
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      backgroundColor: themeState.currentTheme['Dialog Background'],
                      content: SizedBox(
                        height: MediaQuery.of(context).size.height / 2,
                        child: LobbyCreateDialog(
                          cardInfo: widget.cardInfo,
                          firstGameMode: widget.firstGameMode,
                        ),
                      ),
                    );
                  },
                )
              },
              style: buttonStyle(themeState),
              child: Text(translationState.currentLanguage['Create']!),
            ),
          ),
        ],
      ),
    );
  }
}
