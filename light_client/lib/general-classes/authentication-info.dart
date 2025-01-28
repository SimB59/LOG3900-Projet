class AuthenticationInfo {
  final String pseudo;
  final String password;
  final String socketId;

  const AuthenticationInfo({required this.pseudo, required this.password, required this.socketId});

  AuthenticationInfo.fromJson(Map<String, dynamic> json)
      : pseudo = json['pseudo'],
        password = json['password'],
        socketId = json['socketId'];

  Map<String, dynamic> toJson() => {'pseudo': pseudo, 'password': password, 'socketId': socketId};
}
