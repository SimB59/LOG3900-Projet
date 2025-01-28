import 'package:namer_app/general-classes/coordinate.dart';

class SuccessClick {
  final String socketId;
  final List<Coordinate> differences;
  final String pseudo;

  const SuccessClick(
      {required this.socketId,
      required this.differences,
      required this.pseudo});

  SuccessClick.fromJson(Map<String, dynamic> json)
      : socketId = json["socketId"],
        differences = coordinateListFromJson(json["differences"]),
        pseudo = json['pseudo'];
}
