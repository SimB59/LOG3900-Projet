class GameConstantsIO {
  final int initial;
  final int penalty;
  final int gain;
  final bool isCheatMode;
  final String lobbyId;
  final String cardId;

  const GameConstantsIO({
    required this.initial,
    required this.penalty,
    required this.gain,
    required this.isCheatMode,
    required this.lobbyId,
    required this.cardId,
  });

  GameConstantsIO.fromJson(Map<String, dynamic> json)
      : initial = json['initial'],
        penalty = json['penalty'],
        gain = json['gain'],
        isCheatMode = json['isCheatMode'],
        lobbyId = json['lobbyId'],
        cardId = json['cardId'];

  Map<String, dynamic> toJson() => {
        'initial': initial,
        'penalty': penalty,
        'gain': gain,
        'isCheatMode': isCheatMode,
        'lobbyId': lobbyId,
        'cardId': cardId,
      };
}
