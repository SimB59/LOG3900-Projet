import 'package:namer_app/general-classes/coordinate.dart';

class ObserverInteractionInfo {
  final List<Coordinate> coords;
  final String senderId;
  final bool isRightSide;

  const ObserverInteractionInfo(
      {required this.coords,
      required this.senderId,
      required this.isRightSide});

  ObserverInteractionInfo.fromJson(Map<String, dynamic> json)
      : coords = coordinateListFromJson(json["coords"]),
        senderId = json["senderId"],
        isRightSide = json['isRightSide'];
}
