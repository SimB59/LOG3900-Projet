class Winner {
  final String socketId;

  const Winner({required this.socketId});

  Winner.fromJson(Map<String, dynamic> json) : socketId = json["socketId"];

  Map<String, dynamic> toJson() => {
        'socketId': socketId,
      };
}
