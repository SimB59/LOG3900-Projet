import 'package:namer_app/general-classes/lobby-type.dart';

class LobbyIO {
  final String cardId;
  final String? firstMode;
  final String? secondMode;
  final String? playerName;
  final String? playerId;
  final String? lobbyId;
  final LobbyType? lobbyType;

  const LobbyIO(
      {required this.cardId,
      this.firstMode,
      this.secondMode,
      this.playerName,
      this.playerId,
      this.lobbyId, 
      this.lobbyType});

  Map<String, dynamic> toJson() => {
        'cardId': cardId,
        'firstMode': firstMode,
        'secondMode': secondMode,
        'playerName': playerName,
        'playerId': playerId,
        'lobbyId': lobbyId,
        'lobbyType': lobbyType!.value,
      };
}
