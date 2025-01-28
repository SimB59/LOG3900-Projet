import 'package:namer_app/general-classes/coordinate.dart';

class AddedDifference {
  final String socketId;
  final List<Coordinate> addedDifference;
  final String pseudo;

  const AddedDifference(
      {required this.socketId,
      required this.addedDifference,
      required this.pseudo});

  AddedDifference.fromJson(Map<String, dynamic> json)
      : socketId = json["socketId"],
        addedDifference = coordinateListFromJson(json["addedDifference"]),
        pseudo = json['pseudo'];
}
