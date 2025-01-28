import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-constants-data.dart';
import 'package:namer_app/general-classes/game-constants-io.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:provider/provider.dart';

const int minInitialTime = 30;
const int maxInitialTime = 120;

const int minPenaltyTime = 1;
const int maxPenaltyTime = 45;

const int minWonTime = 1;
const int maxWonTime = 30;

class GameConstants extends StatefulWidget {
  final FirstGameMode firstGameMode;
  const GameConstants({super.key, required this.firstGameMode});

  @override
  State<GameConstants> createState() => _GameConstantsState();
}

class _GameConstantsState extends State<GameConstants> {
  final _constantsFormKey = GlobalKey<FormState>();
  TextEditingController _initialTimeController = TextEditingController();
  TextEditingController _penaltyTimeController = TextEditingController();
  TextEditingController _wonTimeController = TextEditingController();
  bool _isCheatModeActivated = false;

  @override
  void initState() {
    super.initState();
    _setConstantsToPresets();
  }

  @override
  void dispose() {
    _initialTimeController.dispose();
    _penaltyTimeController.dispose();
    _wonTimeController.dispose();
    super.dispose();
  }

  void _setConstantsToPresets() {
    _initialTimeController = TextEditingController(text: '30');
    _penaltyTimeController = TextEditingController(text: '5');
    _wonTimeController = TextEditingController(text: '5');
    _isCheatModeActivated = false;
  }

  void _resetConstants() {
    _setConstantsToPresets();
    _validateConstants();
  }

  void _validateConstants() {
    if (_constantsFormKey.currentState!.validate()) {
      LobbyState lobbyState = LobbyState();
      GameState gameState = GameState();
      lobbyState.constantsContainUnconfirmedChanges = false;
      GameConstantsData constantsData = GameConstantsData(
          initial: int.parse(_initialTimeController.text),
          penalty: int.parse(_penaltyTimeController.text),
          gain: int.parse(_wonTimeController.text),
          isCheatMode: _isCheatModeActivated);
      lobbyState.gameConstantsIO = GameConstantsIO(
          initial: constantsData.initial,
          penalty: constantsData.penalty,
          gain: constantsData.gain,
          isCheatMode: constantsData.isCheatMode,
          lobbyId: lobbyState.lobbyId,
          cardId: gameState.game.id);
      gameState.constantsData = constantsData;
      gameState.socket.send('updateLobbyConstants',
          jsonEncode(lobbyState.gameConstantsIO.toJson()));
    }
  }

  bool _isIllegalInput(int value, int bottomLimit, int topLimit) {
    return (value < bottomLimit || value > topLimit);
  }

  void _textFieldChanged(
      TextEditingController controller, String compareValue) {
    LobbyState lobbyState = LobbyState();
    if (controller.text != compareValue) {
      setState(() {
        lobbyState.setConstantsContainUnconfirmedChanges(true);
      });
    } else if (lobbyState.constantsContainUnconfirmedChanges) {
      setState(() {
        lobbyState.setConstantsContainUnconfirmedChanges(false);
      });
    }
  }

  void _checkBoxChanged(bool newValue) {
    GameState gameState = GameState();
    LobbyState lobbyState = LobbyState();

    if (newValue != gameState.constantsData.isCheatMode) {
      setState(() {
        lobbyState.setConstantsContainUnconfirmedChanges(true);
      });
    } else if (lobbyState.constantsContainUnconfirmedChanges) {
      setState(() {
        lobbyState.setConstantsContainUnconfirmedChanges(false);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    GameState gameState = context.watch<GameState>();
    LobbyState lobbyState = context.watch<LobbyState>();
    var themeState = context.watch<ThemeState>();
    TranslationState translationState = context.watch<TranslationState>();

    if (!lobbyState.constantsContainUnconfirmedChanges) {
      _initialTimeController.text = gameState.constantsData.initial.toString();
      _penaltyTimeController.text = gameState.constantsData.penalty.toString();
      _wonTimeController.text = gameState.constantsData.gain.toString();
      _isCheatModeActivated = gameState.constantsData.isCheatMode;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Center(
          child: SizedBox(
            height: 20,
            child: Visibility(
              visible: lobbyState.constantsContainUnconfirmedChanges,
              child: Text(
                translationState
                    .currentLanguage['You must confirm the new constants']!,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: const Color.fromRGBO(0, 213, 255, 0.42),
            borderRadius: BorderRadius.circular(25),
            border: Border.all(
              color: Colors.white,
              width: 2,
            ),
          ),
          child: SafeArea(
            child: Form(
              key: _constantsFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Text(
                    translationState.currentLanguage['Game constants']!,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: themeState.currentTheme['Button foreground'],
                      fontSize: 20,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 5),
                    child: Container(
                      constraints:
                          const BoxConstraints(minWidth: 100, maxWidth: 500),
                      child: Builder(builder: (context) {
                        if (lobbyState.isGameCreator) {
                          return TextFormField(
                            textAlign: TextAlign.center,
                            controller: _initialTimeController,
                            validator: (value) {
                              if (value == null ||
                                  int.tryParse(value) == null ||
                                  _isIllegalInput(int.parse(value),
                                      minInitialTime, maxInitialTime)) {
                                return translationState.currentLanguage[
                                    'Value between 30 and 120 seconds required']!;
                              }
                              return null;
                            },
                            onChanged: (String? newValue) {
                              _textFieldChanged(_initialTimeController,
                                  gameState.constantsData.initial.toString());
                              if (_constantsFormKey.currentState!.validate()) {}
                            },
                            decoration: InputDecoration(
                              labelText: translationState
                                  .currentLanguage['Initial time (s)']!,
                              border: const OutlineInputBorder(),
                            ),
                          );
                        } else {
                          return Text(
                            '${translationState.currentLanguage['Initial time (s)']!} : ${gameState.constantsData.initial.toString()}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: themeState.currentTheme['Button foreground'],
                              fontSize: 16,
                            ),
                          );
                        }
                      }),
                    ),
                  ),
                  Visibility(
                    visible: widget.firstGameMode == FirstGameMode.LIMITED_TIME,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 5),
                      child: Container(
                        constraints:
                            const BoxConstraints(minWidth: 100, maxWidth: 500),
                        child: Builder(builder: (context) {
                          if (lobbyState.isGameCreator) {
                            return TextFormField(
                              textAlign: TextAlign.center,
                              controller: _penaltyTimeController,
                              validator: (value) {
                                int numberValue = int.parse(value!);
                                if (value.isEmpty ||
                                    int.tryParse(value) == null ||
                                    _isIllegalInput(numberValue, minPenaltyTime,
                                        maxPenaltyTime)) {
                                  return translationState.currentLanguage[
                                      'Value between 1 and 45 seconds required']!;
                                }
                                return null;
                              },
                              onChanged: (String? newValue) {
                                _textFieldChanged(_penaltyTimeController,
                                    gameState.constantsData.penalty.toString());
                                if (_constantsFormKey.currentState!
                                    .validate()) {}
                              },
                              decoration: InputDecoration(
                                labelText: translationState
                                    .currentLanguage['Penalty time (s)']!,
                                border: const OutlineInputBorder(),
                              ),
                            );
                          } else {
                            return Text(
                              '${translationState.currentLanguage['Penalty time (s)']!} : ${gameState.constantsData.penalty.toString()}',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: themeState.currentTheme['Button foreground'],
                                fontSize: 16,
                              ),
                            );
                          }
                        }),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: widget.firstGameMode == FirstGameMode.LIMITED_TIME,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 5),
                      child: Container(
                        constraints:
                            const BoxConstraints(minWidth: 100, maxWidth: 500),
                        child: Builder(builder: (context) {
                          if (lobbyState.isGameCreator) {
                            return TextFormField(
                              textAlign: TextAlign.center,
                              controller: _wonTimeController,
                              validator: (value) {
                                int numberValue = int.parse(value!);
                                if (value.isEmpty ||
                                    int.tryParse(value) == null ||
                                    _isIllegalInput(
                                        numberValue, minWonTime, maxWonTime)) {
                                  return translationState.currentLanguage[
                                      'Value between 1 and 30 seconds required']!;
                                }
                                return null;
                              },
                              onChanged: (String? newValue) {
                                _textFieldChanged(_wonTimeController,
                                    gameState.constantsData.gain.toString());
                                if (_constantsFormKey.currentState!
                                    .validate()) {}
                              },
                              decoration: InputDecoration(
                                labelText: translationState
                                    .currentLanguage['Gained time (s)']!,
                                border: const OutlineInputBorder(),
                              ),
                            );
                          } else {
                            return Text(
                              '${translationState.currentLanguage['Gained time (s)']!} : ${gameState.constantsData.gain.toString()}',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: themeState.currentTheme['Button foreground'],
                                fontSize: 16,
                              ),
                            );
                          }
                        }),
                      ),
                    ),
                  ),
                  Builder(builder: (context) {
                    if (lobbyState.isGameCreator) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Checkbox(
                            value: _isCheatModeActivated,
                            onChanged: (bool? newValue) {
                              setState(() {
                                _isCheatModeActivated = newValue!;
                                // gameState.constantsData.isCheatMode = newValue;
                                _checkBoxChanged(newValue);
                              });
                            },
                          ),
                          const SizedBox(width: 15),
                          Text(
                            translationState.currentLanguage['Cheat mode']!,
                            style: TextStyle(fontWeight: FontWeight.bold, color: themeState.currentTheme['Button foreground'],),
                          ),
                        ],
                      );
                    } else {
                      String activatedText = gameState.constantsData.isCheatMode
                          ? translationState.currentLanguage['Activated']!
                          : translationState.currentLanguage['Disabled']!;
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          '${translationState.currentLanguage['Cheat mode']!} : $activatedText',
                          style: TextStyle(fontWeight: FontWeight.bold, color: themeState.currentTheme['Button foreground'],),
                        ),
                      );
                    }
                  }),
                  Visibility(
                    visible: lobbyState.isGameCreator,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        SizedBox(
                          width: 65,
                          child: ElevatedButton(
                            style: buttonStyle(themeState),
                            onPressed: _resetConstants,
                            child: const FittedBox(
                              fit: BoxFit.fitWidth,
                              child: Icon(Icons.restore),
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 65,
                          child: ElevatedButton(
                            style: disableableButtonStyle(themeState,
                                lobbyState.constantsContainUnconfirmedChanges),
                            onPressed: _validateConstants,
                            child: const FittedBox(
                              fit: BoxFit.fitWidth,
                              child: Icon(Icons.check_circle_outline_outlined),
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
