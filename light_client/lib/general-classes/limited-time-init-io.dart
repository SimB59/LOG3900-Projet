import 'package:namer_app/general-classes/game-card-info.dart';

class LimitedTimeInitIO {
  final List<GameCardInfo> cards;
  final List<int> differenceIndices;

  const LimitedTimeInitIO(
      {required this.cards, required this.differenceIndices});

  LimitedTimeInitIO.fromJson(Map<String, dynamic> json)
      : cards = gameCardInfoListFromJson(json['cards']),
        differenceIndices = intListFromJson(json['differenceIndices']);
}

List<int> intListFromJson(dynamic json) {
  List<int> elements = [];
  for (var element in json) {
    elements.add(element);
  }
  return elements;
}
