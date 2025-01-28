import 'dart:convert';

import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:socket_io_client/socket_io_client.dart';

class AccountSocketService {
  late Socket accountSocket;

  AccountSocketService._privateConstructor() {
    accountSocket = io("${getServerUrl()}/account", <String, dynamic>{
      'transports': ['websocket'],
    });

  }

  static final AccountSocketService _instance = AccountSocketService._privateConstructor();

  factory AccountSocketService() => _instance;

  void sendSocketMessage(String event, String data) {
    accountSocket.emit(event, data);
  }

  void sendSocketSearch(String event, List<String> data) {
    accountSocket.emit(event, jsonEncode(data));
  }

  void sendSocketRequest(String event, List<FriendData> data) {
    accountSocket.emit(event, jsonEncode(friendListToJson(data)));
  }

  void addCallbackToMessage(String message, Function(dynamic) callback) {
    accountSocket.on(message, callback);
  }
}