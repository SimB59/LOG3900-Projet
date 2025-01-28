import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-constants-data.dart';

class StartGameData {
  final String lobbyId;
  final String cardId;
  final FirstGameMode firstMode;
  final GameConstantsData constants;

  const StartGameData(
      {required this.lobbyId,
      required this.cardId,
      required this.firstMode,
      required this.constants});

  StartGameData.fromJson(Map<String, dynamic> json)
      : lobbyId = json['lobbyId'],
        cardId = json['cardId'],
        firstMode = FirstGameModeExtension.fromString(json['firstMode']),
        constants = GameConstantsData.fromJson(json['constants']);

  Map<String, dynamic> toJson() => {
        'lobbyId': lobbyId,
        'cardId': cardId,
        'firstMode': firstMode.index,
        'constants': constants.toJson()
      };
}
