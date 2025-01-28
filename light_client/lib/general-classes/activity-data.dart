

class ActivityData {
  final String accountId;
  final String date;
  final String time;
  final String connectionType;

  const ActivityData(
      {required this.accountId,
      required this.date,
      required this.time,
      required this.connectionType,});

  ActivityData.fromJson(Map<String, dynamic> json)
      : accountId = json['accountId'],
        date = json['date'],
        time = json['time'],
        connectionType = json['connectionType'];
}

List<ActivityData> activityListFromJson(dynamic json) {
  List<ActivityData> activityData = [];
  for (var activity in json) {
    ActivityData location = ActivityData.fromJson(activity);
    activityData.add(location);
  }

  return activityData;
}