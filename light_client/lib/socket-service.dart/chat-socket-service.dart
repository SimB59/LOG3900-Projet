import 'dart:convert';

import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';
import 'package:socket_io_client/socket_io_client.dart';

class ChatSocketService {
  late Socket chatSocket;

  ChatSocketService() {
    chatSocket = io("${getServerUrl()}/chat", <String, dynamic>{
      'transports': ['websocket'],
    });
  }

  void sendChat(String event, ChatEntry data) {
    chatSocket.emit(event, jsonEncode(data.toJson()));
  }

  void addCallbackToMessageChatSocket(
      String message, Function(dynamic) callback) {
    chatSocket.on(message, callback);
  }
}
