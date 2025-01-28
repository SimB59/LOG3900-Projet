class LogoutData {
  final String userId;
  final String currentLanguage;

  const LogoutData({required this.userId, required this.currentLanguage});

  LogoutData.fromJson(Map<String, dynamic> json)
      : userId = json['userId'],
        currentLanguage = json['currentLanguage'];

  Map<String, dynamic> toJson() =>
      {'userId': userId, 'currentLanguage': currentLanguage};
}
