class Player {
  final String pseudo;
  int differenceCount;
  String? displayRank;

  Player(
      {required this.pseudo, required this.differenceCount, this.displayRank});

  Player.fromJson(Map<String, dynamic> json)
      : pseudo = json["pseudo"],
        differenceCount = json["differenceCount"];
}
