class GameConstantsData {
  late int initial;
  late int penalty;
  late int gain;
  late bool isCheatMode;

  GameConstantsData(
      {required this.initial,
      required this.penalty,
      required this.gain,
      required this.isCheatMode});

  GameConstantsData.fromJson(Map<String, dynamic> json)
      : initial = json['initial'],
        penalty = (json['penalty'] != null) ? json['penalty'] : 5,
        gain = (json['gain'] != null) ? json['gain'] : 5,
        isCheatMode =
            (json['isCheatMode'] != null) ? json['isCheatMode'] : false;

  Map<String, dynamic> toJson() => {
        'initial': initial,
        'penalty': penalty,
        'gain': gain,
        'isCheatMode': isCheatMode
      };
}
