import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/stats-changed-data.dart';
import 'package:namer_app/socket-service.dart/card-socket-service.dart';

class CardsState extends ChangeNotifier {
  static final CardsState _instance = CardsState._internal();
  late CardSocketService socket;
  late List<GameCardInfo> cardsData = [];
  late List<GameCardInfo> activeCardsData = [];
  late bool isLimitedModeEnabled;

  factory CardsState() {
    return _instance;
  }

  CardsState._internal() {
    socket = CardSocketService();
    fetchCards();
    fetchActiveCards();

    handleSocket();
  }

  Future<List<GameCardInfo>> fetchCards() async {
    if (cardsData.isEmpty) {
      var response = await getRequest('card');
      if (response != null) {
        var responseData = json.decode(response.body);
        cardsData = gameCardInfoListFromJson(json.decode(responseData['body']));
      }
    }
    return cardsData;
  }

  Future<List<GameCardInfo>> fetchActiveCards() async {
    if (activeCardsData.isEmpty) {
      var response = await getRequest('card/active');
      if (response != null) {
        var responseData = json.decode(response.body);
        activeCardsData =
            gameCardInfoListFromJson(json.decode(responseData['body']));
      }
    }
    return activeCardsData;
  }

  GameCardInfo getCardById(String id) {
    for (GameCardInfo cardInfo in cardsData) {
      if (cardInfo.id == id) return cardInfo;
    }
    throw Exception('Card not found for id: $id');
  }

  void handleCardDelete(String cardDeletedId) {
    int index = activeCardsData
        .indexWhere((GameCardInfo cardInfo) => cardInfo.id == cardDeletedId);
    if (index != -1) {
      activeCardsData.removeAt(index);
    }
    notifyListeners();
  }

  void handleStatsChange(StatsChangedData cardInfo) {
    int index =
        cardsData.indexWhere((GameCardInfo card) => card.id == cardInfo.cardId);
    notifyListeners();
  }

  void handleSocket() {
    socket.addCallbackToMessage(
        'cardDeleted', (cardDeletedId) => handleCardDelete(cardDeletedId));
    socket.addCallbackToMessage(
        'cardCreated',
        (cardCreatedInfo) => {
              cardsData.add(GameCardInfo.fromJson(
                  json.decode(cardCreatedInfo.toString()))),
              activeCardsData.add(GameCardInfo.fromJson(
                  json.decode(cardCreatedInfo.toString()))),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'statsChanged',
        (cardInfo) => handleStatsChange(
            StatsChangedData.fromJson(json.decode(cardInfo.toString()))));
    socket.addCallbackToMessage(
        'limitedModeEnable',
        (isEnable) => {
              isLimitedModeEnabled = (isEnable.toString() == 'true'),
              notifyListeners()
            });
  }
}
