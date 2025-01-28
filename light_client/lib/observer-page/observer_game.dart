class ObserverGame {
  final String roomName;
  final int playerCount;
  final int observerCount;
  final List<String> players;

  ObserverGame(
      this.roomName, this.playerCount, this.observerCount, this.players);

  // Factory constructor for creating a new ObserverGame instance from a JSON map
  factory ObserverGame.fromJson(Map<String, dynamic> json) {
    return ObserverGame(
      json['gameRoomName'] as String,
      json['playerCount'] as int,
      json['observerCount'] as int,
      List<String>.from(json['players'] as List<dynamic>),
    );
  }
}
