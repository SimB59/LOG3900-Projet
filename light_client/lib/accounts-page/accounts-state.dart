import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:namer_app/socket-service.dart/account-socket-service.dart';

class AccountsState extends ChangeNotifier {
  static final AccountsState _instance = AccountsState._internal();
  var friends = <AccountData>[];
  late AccountSocketService socket;
  late AccountFriendService accountFriendService;

  factory AccountsState() {
    return _instance;
  }

  AccountsState._internal() {
    accountFriendService = AccountFriendService();
    socket = AccountSocketService();

    handleSocket();
  }

  void getSearchedFriends(List<String> message) {
    socket.sendSocketSearch('searchPlayers', message);
  }

  void sendFriendRequest(List<FriendData> message) {
    socket.sendSocketRequest('sendFriendRequest', message);
  }

  void sendBlockRequest(List<FriendData> message) {
    socket.sendSocketRequest('sendBlockDemand', message);
  }

  void sendUnBlockRequest(List<FriendData> message) {
    socket.sendSocketRequest('sendUnBlockDemand', message);
  }

  handleSocket() {
    socket.addCallbackToMessage(
        'playersFound',
        (data) => {
              friends = accountListFromJson(jsonDecode(data)),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'accountFriendRequestUpdated',
        (data) => {
              accountFriendService.setAccountFriendData(
                  AccountFriendData.fromJson(jsonDecode(data))),
            });
    socket.addCallbackToMessage(
        'updateBlockedList',
        (data) => {
              accountFriendService.setAccountFriendData(
                  AccountFriendData.fromJson(jsonDecode(data))),
            });
    socket.addCallbackToMessage(
        'updateViewingPlayers',
        (data) => {
              for (int i = 0; i < friends.length; i++)
                {
                  if (friends[i].accountId == jsonDecode(data))
                    {
                      friends.removeAt(i),
                    }
                },
              notifyListeners(),
            });

    socket.addCallbackToMessage('setRank', (data) {
      GameState gameState = GameState();
      gameState.setRank(data);
    });
  }
}
