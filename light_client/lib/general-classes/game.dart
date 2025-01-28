import 'package:namer_app/general-classes/first-game-mode.dart';

class Game {
  late String id;
  late String gameTitle;
  late FirstGameMode firstMode;
  late String difficulty;

  Game(
      {required this.id,
      required this.gameTitle,
      required this.firstMode,
      required this.difficulty});

  void reset() {
    id = '';
    gameTitle = '';
    difficulty = '';
  }
}
