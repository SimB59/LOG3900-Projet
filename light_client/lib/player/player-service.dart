import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/general-classes/player.dart';

class PlayerService {
  late Player self;
  late List<Player> opponents = [];

  PlayerService() {
    self = Player(pseudo: AccountService.accountPseudo, differenceCount: 0);
  }

  Player getPlayer(String name) {
    if (self.pseudo == name) return self;
    for (Player player in opponents) {
      if (player.pseudo == name) return player;
    }

    throw Exception('Player not found: $name');
  }

  void incrementPlayerDiffCount(String pseudo) {
    if (pseudo == self.pseudo) {
      self.differenceCount++;
    } else {
      for (Player player in opponents) {
        if (player.pseudo == pseudo) {
          player.differenceCount++;
          break;
        }
      }
    }
  }

  void decrementPlayerDiffCount(String pseudo) {
    if (pseudo == self.pseudo) {
      if (self.differenceCount > 0) self.differenceCount--;
    } else {
      for (Player player in opponents) {
        if (player.pseudo == pseudo) {
          if (player.differenceCount > 0) player.differenceCount--;
          break;
        }
      }
    }
  }

  void incrementAllPlayersDiffCount() {
    self.differenceCount++;
    for (Player player in opponents) {
      player.differenceCount++;
    }
  }

  void setAllPlayersDiffCount(int number) {
    self.differenceCount = number;
    for (Player player in opponents) {
      player.differenceCount = number;
    }
  }

  void setPlayerDiffCount(String pseudo, int diffCount) {
    if (pseudo == self.pseudo) {
      self.differenceCount = diffCount;
    } else {
      for (Player player in opponents) {
        print(opponents.length);
        if (player.pseudo == pseudo) {
          player.differenceCount = diffCount;
          print('${player.pseudo}.differenceCount = $diffCount');
          break;
        }
      }
    }
  }
}
