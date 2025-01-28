class CardStats {
  FirstModeStats classical;

  CardStats({required this.classical});

  CardStats.fromJson(Map<String, dynamic> json)
      : classical = FirstModeStats.fromJson(json['classical']);

  Map<String, dynamic> toJson() => {'classical': classical.toJson()};

  void reset() {
    classical = const FirstModeStats(solo: [], versus: []);
  }
}

class FirstModeStats {
  final List<SecondModeStats> solo;
  final List<SecondModeStats> versus;

  const FirstModeStats({required this.solo, required this.versus});

  FirstModeStats.fromJson(Map<String, dynamic> json)
      : solo = secondModeStatsListFromJson(json['solo']),
        versus = secondModeStatsListFromJson(json['versus']);

  Map<String, dynamic> toJson() => {
        'solo': secondModeStatsListToJson(solo),
        'versus': secondModeStatsListToJson(versus)
      };
}

class SecondModeStats {
  final String name;
  final int score;

  const SecondModeStats({required this.name, required this.score});

  SecondModeStats.fromJson(Map<String, dynamic> json)
      : name = json['name'],
        score = json['score'];

  Map<String, dynamic> toJson() => {'name': name, 'score': score.toString()};
}

List<SecondModeStats> secondModeStatsListFromJson(List<dynamic> json) {
  List<SecondModeStats> stats = [];

  for (var statistic in json) {
    SecondModeStats stat = SecondModeStats.fromJson(statistic);
    stats.add(stat);
  }

  return stats;
}

List<Map<String, dynamic>> secondModeStatsListToJson(
    List<SecondModeStats> secondModeStats) {
  List<Map<String, dynamic>> jsonList = [];
  for (var stats in secondModeStats) {
    jsonList.add(stats.toJson());
  }
  return jsonList;
}

// CardStats decodeCardStats(dynamic jsonObject) {
//   dynamic classical = jsonObject["classical"];
//   List<SecondModeStats> solo = [];
//   List<SecondModeStats> versus = [];

//   for (var statistic in classical["solo"]) {
//     SecondModeStats soloStat =
//         SecondModeStats(name: statistic["name"], score: statistic["score"]);
//     solo.add(soloStat);
//   }
//   for (var statistic in classical["versus"]) {
//     SecondModeStats versusStat =
//         SecondModeStats(name: statistic["name"], score: statistic["score"]);
//     versus.add(versusStat);
//   }
//   FirstModeStats classicalStats = FirstModeStats(solo: solo, versus: versus);

//   return CardStats(classical: classicalStats);
// }
