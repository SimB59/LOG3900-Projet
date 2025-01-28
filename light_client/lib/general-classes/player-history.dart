class PlayerHistory {
  final double timestamp;
  final bool isPositive;
  final bool isGameData;

  const PlayerHistory(
      {required this.timestamp,
      required this.isPositive,
      required this.isGameData});

  PlayerHistory.fromJson(Map<String, dynamic> json)
      : timestamp = json["timestamp"],
        isPositive = json["isPositive"],
        isGameData = json["isGameData"];

  Map<String, dynamic> toJson() => {
        'timestamp': timestamp,
        'isPositive': isPositive,
        'isGameData': isGameData,
      };
}

List<PlayerHistory> playerHistoryListFromJson(dynamic json) {
  List<PlayerHistory> history = [];
  for (var historyEntry in json) {
    PlayerHistory currentCard = PlayerHistory.fromJson(historyEntry);

    history.add(currentCard);
  }
  return history;
}
