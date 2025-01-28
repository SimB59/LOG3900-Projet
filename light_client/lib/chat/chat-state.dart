import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';
import 'package:namer_app/socket-service.dart/chat-socket-service.dart';

class ChatState extends ChangeNotifier {
  static final ChatState _instance = ChatState._internal();
  var messages = <ChatEntry>[];
  late ChatSocketService socket;
  late bool hasNotification = false;

  factory ChatState() {
    return _instance;
  }

  ChatState._internal() {
    socket = ChatSocketService();
    handleSocket();
  }

  void setHasNotification(bool value) {
    hasNotification = value;
    notifyListeners();
  }

  void sendUserMessage(String message) {
    sendSocketMessage(
      message,
    );
  }

  void sendSocketMessage(String message) {
    ChatEntry data = ChatEntry(
        message, '', ChatEntryType.GLOBAL_CHAT, AccountService.accountPseudo);
    socket.sendChat('message', data);
  }

  handleSocket() {
    socket.addCallbackToMessageChatSocket(
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
