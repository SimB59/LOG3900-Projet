enum SecondGameMode { SOLO, VERSUS }

extension SecondGameModeExtension on SecondGameMode {
  String get value {
    switch (this) {
      case SecondGameMode.SOLO:
        return 'solo';
      case SecondGameMode.VERSUS:
        return 'versus';
    }
  }

  static SecondGameMode fromString(String value) {
    switch (value) {
      case 'solo':
        return SecondGameMode.SOLO;
      case 'versus':
        return SecondGameMode.VERSUS;
      default:
        throw ArgumentError('Invalid value: $value');
    }
  }
}
