import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:namer_app/socket-service.dart/account-socket-service.dart';

const int HTTP_STATUS_OK = 200;

class AccountFriendService extends ChangeNotifier {
  static final AccountFriendService _instance =
      AccountFriendService._internal();
  late AccountSocketService socket;
  AccountFriendData accountFriendData = const AccountFriendData(
      accountId: '',
      friendList: [],
      requestSentList: [],
      receivedRequestList: [],
      blockedList: [],
      blockedByList: []);
  List<FriendData> friendsOFriends = [];

  factory AccountFriendService() {
    return _instance;
  }

  AccountFriendService._internal() {
    socket = AccountSocketService();
    handleSocket();
  }

  void updateAccountFriendService() {
    socket.sendSocketMessage(
        'updateAccountFriendData', AccountService.accountUserId);
  }

  void updateFriendsOfFriends() {
    socket.sendSocketMessage(
        'updateFriendsOfFriends', AccountService.accountUserId);
  }

  void setAccountFriendData(AccountFriendData accountFriendDataTemp) {
    accountFriendData = accountFriendDataTemp;
    notifyListeners();
  }

  List<FriendData> getFriendRequests() {
    return accountFriendData.receivedRequestList;
  }

  void acceptFriendRequest(List<FriendData> message) {
    socket.sendSocketRequest('acceptReceivedFriendRequest', message);
  }

  void refuseFriendRequest(List<FriendData> message) {
    socket.sendSocketRequest('refuseReceivedFriendRequest', message);
  }

  void removeFriend(List<FriendData> message) {
    socket.sendSocketRequest('removeFriend', message);
  }

  void handleSocket() {
    socket.addCallbackToMessage(
        'accountFriendDataFound',
        (data) => {
              accountFriendData = AccountFriendData.fromJson(jsonDecode(data)),
              notifyListeners(),
            });

    socket.addCallbackToMessage(
        'friendsOfFriendsFound',
        (data) => {
              friendsOFriends = friendListFromJson(jsonDecode(data)),
              notifyListeners(),
            });
    socket.addCallbackToMessage(
        'blockedByOther',
        (data) => {
              accountFriendData = AccountFriendData.fromJson(jsonDecode(data)),
              notifyListeners(),
            });
    socket.addCallbackToMessage(
        'accountFriendRequestAnswerUpdated',
        (data) => {
              accountFriendData = AccountFriendData.fromJson(jsonDecode(data)),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'accountFriendListUpdated',
        (data) => {
              accountFriendData = AccountFriendData.fromJson(jsonDecode(data)),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'updateFriendList',
        (data) => {
              accountFriendData = AccountFriendData.fromJson(jsonDecode(data)),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'updateFriendsOfFriendsNow',
        (data) => {
              updateFriendsOfFriends(),
            });
  }
}
