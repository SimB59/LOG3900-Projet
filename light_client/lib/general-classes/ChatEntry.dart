

enum ChatEntryType {USER, EVENT, GLOBAL, SELF, OPPONENT, GLOBAL_CHAT}

class ChatEntry {
  final String message;
  final String timestamp;
  final ChatEntryType type;
  final String playerName;

  ChatEntry(this.message, this.timestamp, this.type, this.playerName);

  /// Convert from JSON response stream to ChatEntry object
  ChatEntry.fromJson(Map<String, dynamic> json)
      : message = json['message'],
        type = (json['type'].runtimeType == int) ? _chatEntryTypeFromJsonHeavy(json['type']) : _chatEntryTypeFromJsonLight(json['type']),
        timestamp = json['timestamp'],
        playerName = json['playerName'];

  /// Convert an in-memory representation of a ChatEntry object to a Map<String, dynamic>
  Map<String, dynamic> toJson() => {
        "message": message,
        "timestamp": timestamp,
        "type": type.index,
        "playerName": playerName,
  };

  static _chatEntryTypeFromJsonHeavy(int type){
    switch (type) {
            case 0:
                return ChatEntryType.USER;
            case 3:
                return ChatEntryType.SELF;
            case 2:
                return ChatEntryType.GLOBAL;
            case 5:
                return ChatEntryType.GLOBAL_CHAT;
            default:
                return ChatEntryType.OPPONENT;
        }
  }

  static _chatEntryTypeFromJsonLight(String type){
    switch (type) {
            case 'USER':
                return ChatEntryType.USER;
            case 'SELF':
                return ChatEntryType.SELF;
            case 'GLOBAL':
                return ChatEntryType.GLOBAL;
            case 'GLOBAL_CHAT':
                return ChatEntryType.GLOBAL_CHAT;
            default:
                return ChatEntryType.OPPONENT;
        }
  }
}