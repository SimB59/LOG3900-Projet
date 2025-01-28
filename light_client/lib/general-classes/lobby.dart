import 'package:namer_app/general-classes/lobby-type.dart';

class Lobby {
  final List<String> players;
  final LobbyType lobbyType;

  const Lobby({required this.players, required this.lobbyType});
}
