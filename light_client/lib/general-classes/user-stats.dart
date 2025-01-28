class UserStats {
  final int gamesPlayed;
  final int gamesWon;
  final double meanDifferencesFoundPerGame;
  final double timeMeanPerGame;

  const UserStats(
      {required this.gamesPlayed,
      required this.gamesWon,
      required this.meanDifferencesFoundPerGame,
      required this.timeMeanPerGame});

  UserStats.fromJson(Map<String, dynamic> json)
      : gamesPlayed = json["gamesPlayed"],
        gamesWon = json["gamesWon"],
        meanDifferencesFoundPerGame = json["meanDifferencesFoundPerGame"],
        timeMeanPerGame = json["timeMeanPerGame"];

  Map<String, dynamic> toJson() => {
        'gamesPlayed': gamesPlayed,
        'gamesWon': gamesWon,
        'meanDifferencesFoundPerGame': meanDifferencesFoundPerGame,
        'timeMeanPerGame': timeMeanPerGame,
      };
}
