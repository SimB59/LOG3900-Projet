import 'package:namer_app/general-classes/game-constants-data.dart';
import 'package:namer_app/general-classes/game-event.dart';

class VideoReplayData {
  final String videoId;
  final List<GameEvent> gameEvents;
  final List<String> playerOpponentNames;
  final String playerSharingName;
  final String cardId;
  final GameConstantsData constants;
  bool isPublic;
  final String pseudo;
  final String cardName;
  final String accountId;
  final String date;

  VideoReplayData(
      {required this.videoId,
      required this.gameEvents,
      required this.playerOpponentNames,
      required this.playerSharingName,
      required this.cardId,
      required this.constants,
      required this.isPublic,
      required this.pseudo,
      required this.cardName,
      required this.accountId,
      required this.date});

  VideoReplayData.fromJson(Map<String, dynamic> json)   
    : videoId = json['videoId'],
      gameEvents = gameEventListFromJson(json['gameEvents']),
      playerOpponentNames = stringListFromJson(json['playerOpponentNames']),
      playerSharingName = json['playerSharingName'],
      cardId = json['cardId'],
      constants = GameConstantsData.fromJson(json['constants']),
      isPublic = json['isPublic'],
      pseudo = json['pseudo'],
      cardName = json['cardName'],
      accountId = json['accountId'],
      date = json['date'];

  Map<String, dynamic> toJson() => {
    'videoId': videoId,
    'gameEvents': gameEventListToJson(gameEvents),
    'playerOpponentNames': playerOpponentNames,
    'playerSharingName': playerSharingName,
    'cardId': cardId,
    'constants': constants.toJson(),
    'isPublic': isPublic,
    'pseudo': pseudo,
    'cardName': cardName,
    'accountId': accountId,
    'date': date,
  };
}
  
List<String> stringListFromJson(dynamic json) {
  List<String> elements = [];
  for (var element in json) {
    elements.add(element);
  }
  return elements;
}

List<VideoReplayData> videoReplayListFromJson(dynamic json) {
  List<VideoReplayData> videoReplayData = [];
  for (var videoReplay in json) {
    VideoReplayData location = VideoReplayData.fromJson(videoReplay);
    videoReplayData.add(location);
  }

  return videoReplayData;
}