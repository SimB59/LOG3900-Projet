enum LobbyType { PUBLIC, FRIENDS, FRIENDS_OF_FRIENDS }

extension LobbyTypeExtension on LobbyType {
  String get value {
    switch (this) {
      case LobbyType.PUBLIC:
        return 'public';
      case LobbyType.FRIENDS:
        return 'friends';
      case LobbyType.FRIENDS_OF_FRIENDS:
        return 'friends of friends';
    }
  }

  int get index {
    switch (this) {
      case LobbyType.PUBLIC:
        return 0;
      case LobbyType.FRIENDS:
        return 1;
      case LobbyType.FRIENDS_OF_FRIENDS:
        return 2;
    }
  }

  static LobbyType fromString(String value) {
    switch (value) {
      case 'public':
        return LobbyType.PUBLIC;
      case 'friends':
        return LobbyType.FRIENDS;
      case 'friends of friends':
        return LobbyType.FRIENDS_OF_FRIENDS;
      default:
        throw ArgumentError('Invalid value: $value');
    }
  }
}
