class PlayerIO {
  final String pseudo;
  final String socketId;

  PlayerIO({required this.pseudo, required this.socketId});

  PlayerIO.fromJson(Map<String, dynamic> json)
      : pseudo = json["pseudo"],
        socketId = json["socketId"];

  Map<String, dynamic> toJson() => {
        'pseudo': pseudo,
        'socketId': socketId,
      };
}

List<PlayerIO> playerIOListFromJson(dynamic json) {
  List<PlayerIO> players = [];
  for (var player in json) {
    PlayerIO location = PlayerIO.fromJson(player);
    players.add(location);
  }

  return players;
}
