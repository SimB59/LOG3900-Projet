import 'card-stats.dart';
import 'coordinate.dart';

class GameCardInfo {
  late int enlargementRadius;
  late List<List<Coordinate>> differences;
  late String title;
  late CardStats stats;
  late String difficultyLevel;
  late String id;

  GameCardInfo(
      {required this.enlargementRadius,
      required this.differences,
      required this.title,
      required this.stats,
      required this.difficultyLevel,
      required this.id});

  GameCardInfo.fromJson(Map<String, dynamic> json)
      : enlargementRadius = json["enlargementRadius"],
        differences = coordinateListListFromJson(json["differences"]),
        title = json["title"],
        stats = CardStats.fromJson(json["stats"]),
        difficultyLevel = json["difficultyLevel"],
        id = json["id"];

  void reset() {
    enlargementRadius = 0;
    differences = [];
    title = '';
    stats.reset();
    difficultyLevel = '';
    id = '';
  }
}

List<GameCardInfo> gameCardInfoListFromJson(dynamic json) {
  List<GameCardInfo> cards = [];
  for (var gameCardInfo in json) {
    GameCardInfo currentCard = GameCardInfo.fromJson(gameCardInfo);

    cards.add(currentCard);
  }
  return cards;
}
