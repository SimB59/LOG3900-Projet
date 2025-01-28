import 'dart:convert';

import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';
import 'package:namer_app/general-classes/video-replay-data.dart';
import 'package:socket_io_client/socket_io_client.dart';

class GameSocketService {
  late Socket gameSocket;

  GameSocketService() {
    gameSocket = io("${getServerUrl()}/game", <String, dynamic>{
      'transports': ['websocket'],
    });
  }

  void addCallbackToMessage(String message, Function(dynamic) callback) {
    gameSocket.on(message, callback);
  }

  void sendChat(String event, ChatEntry data) {
    gameSocket.emit(event, jsonEncode(data.toJson()));
  }

  void sendVideoReplay(String event, VideoReplayData videoReplayData) {
    gameSocket.emit(event, jsonEncode(videoReplayData.toJson()));
  }

  void send(String event, [String? data]) {
    if (data != null) {
      gameSocket.emit(event, data);
    } else {
      gameSocket.emit(event);
    }
  }
}
