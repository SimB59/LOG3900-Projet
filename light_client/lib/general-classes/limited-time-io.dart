import 'package:namer_app/general-classes/game-card-info.dart';

class LimitedTimeIO {
  final GameCardInfo card;
  final int differenceIndex;

  const LimitedTimeIO({required this.card, required this.differenceIndex});

  LimitedTimeIO.fromJson(Map<String, dynamic> json)
      : card = GameCardInfo.fromJson(json['card']),
        differenceIndex = json['differenceIndex'];
}
