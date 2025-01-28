class Message {
  final String title;
  final String body;

  const Message({required this.title, required this.body});

  Message.fromJson(Map<String, dynamic> json)
      : title = json["title"],
        body = json["body"];

  Map<String, dynamic> toJson() => {
        'title': title,
        'body': body,
      };
}
