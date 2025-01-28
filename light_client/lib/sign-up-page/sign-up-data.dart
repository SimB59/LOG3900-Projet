class SignUpData {
  final String email;
  final String pseudo;
  final String password;
  final String
      avatarFilePath; // Now storing a file path instead of an AvatarImage
  final String language;
  final String theme;

  const SignUpData({
    required this.email,
    required this.pseudo,
    required this.password,
    required this.avatarFilePath,
    required this.language,
    required this.theme,
  });

  SignUpData.fromJson(Map<String, dynamic> json)
      : email = json['email'],
        pseudo = json['pseudo'],
        password = json['password'],
        // Assume the JSON contains the file path as a string, not the actual File object
        avatarFilePath = json['avatarFilePath'],
        language = json['language'],
        theme = json['theme'];

  Map<String, dynamic> toJson() => {
        'email': email,
        'pseudo': pseudo,
        'password': password,
        'avatarFilePath': avatarFilePath, // Serialize the file path as a string
        'language': language,
        'theme': theme,
      };
}
