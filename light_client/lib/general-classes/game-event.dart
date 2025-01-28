import 'package:namer_app/general-classes/winner.dart';

class GameEvent {
  final String method;
  final int timestamp;
  List<dynamic>? params;

  GameEvent(
      {required this.method,
      required this.timestamp,
      this.params});

  Map<String, dynamic> toJson() {
    return {
      'method': method,
      'timestamp': timestamp,
      'params': params,
    };
  }

  factory GameEvent.fromJson(Map<String, dynamic> json) {
    List<dynamic>? params = json['params'];

    if (params != null && params is List<dynamic>) {
      List<dynamic> updatedParams = [];
      for (var param in params) {
        if (param is Map<String, dynamic> &&
            param.containsKey('socketId')) {
          updatedParams.add(Winner.fromJson(param));
        } else {
          updatedParams.add(param);
        }
      }
      return GameEvent(
        method: json['method'],
        timestamp: json['timestamp'],
        params: updatedParams,
      );
    } else {
      return GameEvent(
        method: json['method'],
        timestamp: json['timestamp'],
        params: params,
      );
    }
  }
}

List<dynamic> dynamicListFromJson(dynamic json) {
  List<dynamic> elements = [];
  for (var element in json) {
    elements.add(element);
  }
  return elements;
}

List<GameEvent> gameEventListFromJson(dynamic json) {
  List<GameEvent> gameEventData = [];
  for (var gameEvent in json) {
    GameEvent location = GameEvent.fromJson(gameEvent);
    gameEventData.add(location);
  }

  return gameEventData;
}

List<Map<String, dynamic>> gameEventListToJson(List<GameEvent> gameEventList) {
  List<Map<String, dynamic>> jsonList = [];
  for (var gameEvent in gameEventList) {
    jsonList.add(gameEvent.toJson());
  }
  return jsonList;
}
