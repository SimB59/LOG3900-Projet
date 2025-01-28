


class GameHistoryData {
  final String accountId;
  final String date;
  final String time;
  final bool isWinner;
  final double duration;
  final int numberOfDifferenceFound;
  final String firstMode;
  final String gameId;


  const GameHistoryData(
      {required this.accountId,
      required this.date,
      required this.time,
      required this.isWinner,
      required this.duration,
      required this.numberOfDifferenceFound,
      required this.firstMode,
      required this.gameId,});

  GameHistoryData.fromJson(Map<String, dynamic> json)
      : accountId = json['accountId'],
        date = json['date'],
        time = json['time'],
        isWinner = json['isWinner'],
        duration = json['duration'],
        numberOfDifferenceFound = json['numberOfDifferenceFound'],
        firstMode = json['firstMode'],
        gameId = json['gameId'];

    Map<String, dynamic> toJson() => {
        "accountId": accountId,
        "date": date,
        "time": time,
        "isWinner": isWinner,
        "duration": duration,
        "numberOfDifferenceFound": numberOfDifferenceFound,
        "firstMode": firstMode,
        "gameId": gameId,
  };
}

List<GameHistoryData> gameHistoryListFromJson(dynamic json) {
  List<GameHistoryData> gameHistoryData = [];
  for (var gameHistory in json) {
    GameHistoryData location = GameHistoryData.fromJson(gameHistory);
    gameHistoryData.add(location);
  }

  return gameHistoryData;
}