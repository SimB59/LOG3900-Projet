import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';

class GameChatState extends ChangeNotifier {
  static final GameChatState _instance = GameChatState._internal();
  var messages = <ChatEntry>[];
  late bool hasNotification = false;

  factory GameChatState() {
    return _instance;
  }

  GameChatState._internal() {
    handleSocket();
  }

  void setHasNotification(bool value) {
    hasNotification = value;
    notifyListeners();
  }

  void clearMessageHistory(){
    hasNotification = false;
    messages = [];
  }

  void sendSocketMessage(String message) {
    GameState gameState = GameState();
    ChatEntry data = ChatEntry(
        message, '', ChatEntryType.USER, AccountService.accountPseudo);
    gameState.socket.sendChat('message', data);
  }

  handleSocket() {
    GameState gameState = GameState();
    gameState.socket.addCallbackToMessage(
        'message',
        (data) => {
              hasNotification = true,
              messages.add((data.runtimeType == String)
                  ? ChatEntry.fromJson(jsonDecode(data))
                  : ChatEntry.fromJson(data)),
              notifyListeners()
            });
  }
}