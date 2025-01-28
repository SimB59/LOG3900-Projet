import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:namer_app/socket-service.dart/account-socket-service.dart';

class OtherFriendsState extends ChangeNotifier {
  static final OtherFriendsState _instance = OtherFriendsState._internal();
  var friends = <FriendData>[];
  late AccountSocketService socket;

  factory OtherFriendsState() {
    return _instance;
  }

  OtherFriendsState._internal() {
    socket = AccountSocketService();
    handleSocket();
  }

  void getAccountFriends(List<String> message) {
    socket.sendSocketSearch('getAccountFriends', message);
  }


  handleSocket() {
    socket.addCallbackToMessage(
        'accountFriendsFound',
        (data) => {
              friends =  friendListFromJson(jsonDecode(data)),
              notifyListeners()
            });

            

  }
}