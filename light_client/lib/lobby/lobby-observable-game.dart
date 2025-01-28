class ObservableGame {
  final String gameRoomName;
  final String cardId;
  final int playerCount;
  final int observerCount;
  final List<String> players;

  ObservableGame(this.gameRoomName, this.cardId, this.playerCount,
      this.observerCount, this.players);

  // Factory constructor for creating a new ObserverGame instance from a JSON map
  factory ObservableGame.fromJson(Map<String, dynamic> json) {
    return ObservableGame(
      json['gameRoomName'] as String,
      json['cardId'] as String,
      json['playerCount'] as int,
      json['observerCount'] as int,
      List<String>.from(json['players'] as List<dynamic>),
    );
  }
}
