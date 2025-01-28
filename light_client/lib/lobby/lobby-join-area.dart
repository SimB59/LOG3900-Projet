import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/lobby/lobby-join-dialog.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:provider/provider.dart';

class LobbyJoinArea extends StatefulWidget {
  const LobbyJoinArea({
    super.key,
    required this.cardInfo,
    required this.firstGameMode,
  });

  final GameCardInfo cardInfo;
  final FirstGameMode firstGameMode;

  @override
  State<LobbyJoinArea> createState() => _LobbyJoinAreaState();
}

class _LobbyJoinAreaState extends State<LobbyJoinArea> {
  late LobbyState lobbyState;

  String getLobbyIdFromIndex(int index) {
    int count = -1;
    String lobbyId = '';

    for (var entry in lobbyState
        .getJoinableLobbies(widget.cardInfo.id, widget.firstGameMode)
        .entries) {
      count++;
      if (count == index) {
        lobbyId = entry.key;
        break;
      }
    }
    return lobbyId;
  }

  @override
  Widget build(BuildContext context) {
    lobbyState = context.watch<LobbyState>();
    var themeState = context.watch<ThemeState>();
    var translateState = context.watch<TranslationState>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Visibility(
          visible: lobbyState
              .getRange(widget.cardInfo.id, widget.firstGameMode)
              .isEmpty,
          child: Text(
            translateState.currentLanguage['Waiting for players']!,
            style: TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
        ),
        SizedBox(
          height: 250,
          width: 450,
          child: ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            itemCount: lobbyState
                .getRange(widget.cardInfo.id, widget.firstGameMode)
                .length,
            itemBuilder: (BuildContext context, int index) {
              return SizedBox(
                height: 50,
                child: ElevatedButton(
                  style: buttonStyle(themeState),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          backgroundColor: themeState.currentTheme['Dialog Background'],
                          content: SizedBox(
                            height: MediaQuery.of(context).size.height / 2,
                            child: LobbyJoinDialog(
                              lobbyId: getLobbyIdFromIndex(index),
                              cardInfo: widget.cardInfo,
                              firstGameMode: widget.firstGameMode,
                            ),
                          ),
                        );
                      },
                    );
                  },
                  child: Text(
                      '${translateState.currentLanguage['Lobby']!} #$index'),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
