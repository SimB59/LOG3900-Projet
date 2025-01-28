import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/chat/chat-message-bubble.dart';
import 'package:namer_app/chat/chat-state.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/game-chat/game-chat-state.dart';
import 'package:provider/provider.dart';

class GameChatDialog extends StatefulWidget {
  @override
  State<GameChatDialog> createState() => _GameChatDialogState();
}

class _GameChatDialogState extends State<GameChatDialog> {
  TextEditingController textFieldController = TextEditingController();

  bool isTextFieldEmpty = true;
  bool isOnGameChat = true;

  @override
  void initState() {
    super.initState();
    textFieldController.addListener(_textFieldValueChanged);
  }

  @override
  void dispose() {
    textFieldController.dispose();
    super.dispose();
  }

  void _textFieldValueChanged() {
    setState(() {
      isTextFieldEmpty = (textFieldController.text.isEmpty ||
          textFieldController.text.trim().isEmpty);
    });
  }

  @override
  Widget build(BuildContext context) {
    var chatState = context.watch<ChatState>();
    var gameState = context.watch<GameChatState>();
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    var accountFriendService = context.watch<AccountFriendService>();
    return Dialog(
      backgroundColor: themeState.currentTheme['Dialog Background'],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: <Widget>[
          Row(
            children: [
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    isOnGameChat = true;
                  });
                },
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(
                    (isOnGameChat) ? themeState.currentTheme['Blue Background'] : Colors.grey,
                  ),
                ),
                child: Text(translationState.currentLanguage['Game chat']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
              ),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    isOnGameChat = false;
                  });
                },
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(
                    (!isOnGameChat) ? themeState.currentTheme['Blue Background'] : Colors.grey,
                  ),
                ),
                child: Text(
                  translationState.currentLanguage['Global chat']!,
                  style: TextStyle(color: themeState.currentTheme['Button foreground']),
                ),
              ),
              Spacer(), // Pushes the 'X' button to the right
              IconButton(
                onPressed: () {
                  gameState.setHasNotification(false);
                  chatState.setHasNotification(false);
                  Navigator.of(context).pop(); // Close the dialog
                },
                icon: Icon(Icons.close, color: themeState.currentTheme['Button foreground'],),
              ),
            ],
          ),
          Expanded(
            child: ListView.builder(
              itemCount: (isOnGameChat)
                  ? gameState.messages.length
                  : chatState.messages.length,
              reverse: true,
              itemBuilder: (BuildContext context, int index) {
                final reversedIndex = (isOnGameChat)
                    ? gameState.messages.length - 1 - index
                    : chatState.messages.length - 1 - index;
                if(isOnGameChat){
                  if (!(accountFriendService.accountFriendData.blockedByList.map((friend) => friend.pseudo).contains(gameState.messages[reversedIndex].playerName) || accountFriendService.accountFriendData.blockedList.map((friend) => friend.pseudo).contains(gameState.messages[reversedIndex].playerName))) {
                    return MessageBubble(chat:gameState.messages[reversedIndex]);
                  } else {
                    return null;
                  }
                }else{
                  if (!(accountFriendService.accountFriendData.blockedByList.map((friend) => friend.pseudo).contains(chatState.messages[reversedIndex].playerName) || accountFriendService.accountFriendData.blockedList.map((friend) => friend.pseudo).contains(chatState.messages[reversedIndex].playerName))) {
                    return MessageBubble(chat:chatState.messages[reversedIndex]);
                  } else {
                    return null;
                  }
                }
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.only(left: 10, bottom: 10, top: 10),
            //height: 60,
            color: Colors.white,
            child: Row(
              children: <Widget>[
                const SizedBox(
                  width: 15,
                ),
                Expanded(
                  child: TextField(
                    maxLines: null,
                    controller: textFieldController,
                    decoration: InputDecoration(
                        hintText: translationState
                            .currentLanguage['Write message...'],
                        hintStyle: TextStyle(color: Colors.black54),
                        border: InputBorder.none),
                  ),
                ),
                const SizedBox(
                  width: 15,
                ),
                FloatingActionButton(
                  heroTag: 'sendButton',
                  onPressed: (!isTextFieldEmpty)
                      ? () {
                          (isOnGameChat)
                              ? gameState
                                  .sendSocketMessage(textFieldController.text)
                              : chatState
                                  .sendSocketMessage(textFieldController.text);
                          textFieldController.clear();
                        }
                      : null,
                  backgroundColor:
                      (!isTextFieldEmpty) ? themeState.currentTheme['Blue Background'] : Colors.grey,
                  elevation: 0,
                  child: const Icon(
                    Icons.send,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
