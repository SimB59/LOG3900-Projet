import 'package:namer_app/general-classes/card-stats.dart';

class StatsChangedData {
  final String cardId;
  final CardStats stats;

  const StatsChangedData({required this.cardId, required this.stats});

  StatsChangedData.fromJson(Map<String, dynamic> json)
      : cardId = json['id'],
        stats = CardStats.fromJson(json['stats']);

  Map<String, dynamic> toJson() => {'cardId': cardId, 'stats': stats};
}
