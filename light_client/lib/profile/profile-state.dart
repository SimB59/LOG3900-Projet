import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/general-classes/activity-data.dart';
import 'package:namer_app/general-classes/game-history.dart';
import 'package:namer_app/socket-service.dart/account-socket-service.dart';

class ProfileState extends ChangeNotifier {
  static final ProfileState _instance = ProfileState._internal();
  var activity = <ActivityData>[];
  var gameHistory = <GameHistoryData>[];
  var amountOfGamesPlayed = 0;
  var amountOfGamesWon = 0;
  double averageTimePerGame = 0;
  double averageDifferencesFoundPerGame = 0;
  var rank = '';
  var level = '';
  late AccountSocketService socket;

  factory ProfileState() {
    return _instance;
  }

  ProfileState._internal() {
    socket = AccountSocketService();
    handleSocket();
  }

  void getAccountActivity(String message) {
    socket.sendSocketMessage('getAccountActivity', message);
  }

  void getGameHistory(String message) {
    socket.sendSocketMessage('getGameHistory', message);
  }

  void updateAccountStates() {
    amountOfGamesPlayed = gameHistory.length;
    amountOfGamesWon = 0;
    double totalTime = 0;
    int totalDifferenceFound = 0;
    for (GameHistoryData gameHistoryInstance in gameHistory) { 
      if(gameHistoryInstance.isWinner) amountOfGamesWon++;
      totalTime += gameHistoryInstance.duration;
      totalDifferenceFound += gameHistoryInstance.numberOfDifferenceFound;
    }
    if(amountOfGamesPlayed != 0){
      averageDifferencesFoundPerGame = totalDifferenceFound / amountOfGamesPlayed;
      averageTimePerGame = totalTime / amountOfGamesPlayed;
    } else{
      averageDifferencesFoundPerGame = 0;
      averageTimePerGame = 0;
    }

  }

  handleSocket() {
    socket.addCallbackToMessage(
        'accountActivityFound',
        (data) => {
              activity =  activityListFromJson(jsonDecode(data)),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'accountGameHistoryFound',
        (data) => {
              gameHistory =  gameHistoryListFromJson(jsonDecode(data)),
              updateAccountStates(),
              notifyListeners()
            });
    
      
            

  }
}