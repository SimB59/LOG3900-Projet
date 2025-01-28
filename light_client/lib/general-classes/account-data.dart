class AccountData {
  final String email;
  final String accountId;
  final String pseudo;
  final String password;
  final int accountLevel;
  final int accountRank;
  final String language;
  final String theme;
  final int currency;

  const AccountData(
      {required this.email,
      required this.accountId,
      required this.pseudo,
      required this.password,
      required this.accountLevel,
      required this.accountRank,
      required this.language,
      required this.theme,
      required this.currency});

  AccountData.fromJson(Map<String, dynamic> json)
      : email = json['email'],
        accountId = json['accountId'],
        pseudo = json['pseudo'],
        password = json['password'],
        accountLevel = json['accountLevel'],
        accountRank = json['accountRank'],
        language = json['language'],
        theme = json['theme'],
        currency = json['currency'];
}

List<AccountData> accountListFromJson(dynamic json) {
  List<AccountData> accountData = [];
  for (var account in json) {
    AccountData location = AccountData.fromJson(account);
    accountData.add(location);
  }

  return accountData;
}

class FriendData {
  final String accountId;
  final String pseudo;

  const FriendData({
    required this.accountId,
    required this.pseudo,
  });

  @override
  String toString() {
    return '{accountId: $accountId , pseudo: $pseudo}';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FriendData &&
          runtimeType == other.runtimeType &&
          accountId == other.accountId &&
          pseudo == other.pseudo;

  FriendData.fromJson(Map<String, dynamic> json)
      : accountId = json['accountId'],
        pseudo = json['pseudo'];

  Map<String, dynamic> toJson() => {
        "accountId": accountId,
        "pseudo": pseudo,
      };
}

List<FriendData> friendListFromJson(dynamic json) {
  List<FriendData> friendData = [];
  for (var friend in json) {
    FriendData location = FriendData.fromJson(friend);
    friendData.add(location);
  }

  return friendData;
}

List<Map<String, dynamic>> friendListToJson(List<FriendData> friendList) {
  List<Map<String, dynamic>> jsonList = [];
  for (var friend in friendList) {
    jsonList.add(friend.toJson());
  }
  return jsonList;
}

class AccountFriendData {
  final String accountId;
  final List<FriendData> friendList;
  final List<FriendData> requestSentList;
  final List<FriendData> receivedRequestList;
  final List<FriendData> blockedList;
  final List<FriendData> blockedByList;

  const AccountFriendData({
    required this.accountId,
    required this.friendList,
    required this.requestSentList,
    required this.receivedRequestList,
    required this.blockedList,
    required this.blockedByList,
  });

  AccountFriendData.fromJson(Map<String, dynamic> json)
      : accountId = json['accountId'],
        friendList = friendListFromJson(json['friendList']),
        requestSentList = friendListFromJson(json['requestSentList']),
        receivedRequestList = friendListFromJson(json['receivedRequestList']),
        blockedList = friendListFromJson(json['blockedList']),
        blockedByList = friendListFromJson(json['blockedByList']);

  Map<String, dynamic> toJson() => {
        "accountId": accountId,
        "friendList": friendListToJson(friendList),
        "requestSentList": friendListToJson(requestSentList),
        "receivedRequestList": friendListToJson(receivedRequestList),
        "blockedList": friendListToJson(blockedList),
        "blockedByList": friendListToJson(blockedByList),
      };
}
