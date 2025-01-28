enum FirstGameMode { CLASSIC, LIMITED_TIME, REFLEX }

extension FirstGameModeExtension on FirstGameMode {
  String get value {
    switch (this) {
      case FirstGameMode.CLASSIC:
        return 'classique';
      case FirstGameMode.LIMITED_TIME:
        return 'Limited';
      case FirstGameMode.REFLEX:
        return 'reflex';
    }
  }

  String get displayValue {
    switch (this) {
      case FirstGameMode.CLASSIC:
        return 'Classic';
      case FirstGameMode.LIMITED_TIME:
        return 'Limited Time';
      case FirstGameMode.REFLEX:
        return 'Reflex';
    }
  }

  int get index {
    switch (this) {
      case FirstGameMode.CLASSIC:
        return 0;
      case FirstGameMode.LIMITED_TIME:
        return 1;
      case FirstGameMode.REFLEX:
        return 2;
    }
  }

  static FirstGameMode fromString(String value) {
    switch (value) {
      case 'classique':
        return FirstGameMode.CLASSIC;
      case 'Limited':
        return FirstGameMode.LIMITED_TIME;
      case 'reflex':
        return FirstGameMode.REFLEX;
      default:
        throw ArgumentError('Invalid value: $value');
    }
  }
}
