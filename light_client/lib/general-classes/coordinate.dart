class Coordinate {
  final int x;
  final int y;

  const Coordinate({required this.x, required this.y});

  Coordinate.fromJson(Map<String, dynamic> json)
      : x = json['x'],
        y = json['y'];

  Map<String, dynamic> toJson() => {'x': x, 'y': y};

  @override
  operator ==(o) => o is Coordinate && o.x == x && o.y == y;
}

List<Coordinate> coordinateListFromJson(dynamic json) {
  List<Coordinate> differences = [];
  for (var coord in json) {
    Coordinate location = Coordinate.fromJson(coord);
    differences.add(location);
  }

  return differences;
}

List<List<Coordinate>> coordinateListListFromJson(dynamic json) {
  List<List<Coordinate>> rows = [];
  for (var difference in json) {
    List<Coordinate> differenceCoords = [];
    for (var coord in difference) {
      Coordinate location = Coordinate.fromJson(coord);
      differenceCoords.add(location);
    }
    rows.add(differenceCoords);
  }

  return rows;
}
