import 'dart:convert';

import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';
import 'package:socket_io_client/socket_io_client.dart';

// UTILISER CE FICHIER LE MOINS POSSIBLE!! UTILISER LES FICHIERS SPECIALISES
class SocketService {
  late Socket gameSocket;
  late Socket cardSocket;
  late Socket chatSocket;
  late Socket accountSocket;

  SocketService() {
    gameSocket = io("${getServerUrl()}/game", <String, dynamic>{
      'transports': ['websocket'],
    });
    cardSocket = io("${getServerUrl()}/cards", <String, dynamic>{
      'transports': ['websocket'],
    });
    chatSocket = io("${getServerUrl()}/chat", <String, dynamic>{
      'transports': ['websocket'],
    });
    accountSocket = io("${getServerUrl()}/account", <String, dynamic>{
      'transports': ['websocket'],
    });
  }

  void sendChat(String event, ChatEntry data) {
    chatSocket.emit(event, jsonEncode(data.toJson()));
  }

  void addCallbackToMessage(String message, Function(dynamic) callback,
      {bool isGameSocket = true}) {
    if (isGameSocket) {
      gameSocket.on(message, callback);
    } else {
      cardSocket.on(message, callback);
    }
  }

  void addCallbackToMessageChatSocket(
      String message, Function(dynamic) callback) {
    chatSocket.on(message, callback);
  }

  void send(String event, [String? data]) {
    if (data != null) {
      gameSocket.emit(event, data);
    } else {
      gameSocket.emit(event);
    }
  }
}
