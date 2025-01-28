import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/chat/chat-message-bubble.dart';
import 'package:namer_app/chat/chat-state.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/game-chat/game-chat-state.dart';
import 'package:provider/provider.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  TextEditingController textFieldController = TextEditingController();
  bool isTextFieldEmpty = true;

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
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    var accountFriendService = context.watch<AccountFriendService>();
    var gameState = context.watch<GameChatState>();
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
                  setState(() {});
                },
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(
                    themeState.currentTheme['Blue Background'],
                  ),
                ),
                child: Text(
                  translationState.currentLanguage['Global chat']!,
                  style: TextStyle(color: themeState.currentTheme['Button foreground']),
                ),
              ),
              Spacer(),
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
              itemCount: chatState.messages.length,
              reverse: true,
              itemBuilder: (BuildContext context, int index) {
                final reversedIndex = chatState.messages.length - 1 - index;
                if (!(accountFriendService.accountFriendData.blockedByList.map((friend) => friend.pseudo).contains(chatState.messages[reversedIndex].playerName) || accountFriendService.accountFriendData.blockedList.map((friend) => friend.pseudo).contains(chatState.messages[reversedIndex].playerName))) {
                  return MessageBubble(
                    chat: chatState.messages[reversedIndex],
                  );
                } else {
                  return null;
                }
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.only(left: 10, bottom: 10, top: 10),
            //height: 60,
            width: double.infinity,
            color: Colors.white,
            child: Row(
              children: <Widget>[
                const SizedBox(
                  width: 15,
                ),
                Expanded(
                  child: TextField(
                    controller: textFieldController,
                    onSubmitted: (text) {
                      if (text.isNotEmpty) {
                        chatState.sendUserMessage(text);
                        textFieldController.clear();
                      }
                    },
                    decoration: InputDecoration(
                      hintText:
                          translationState.currentLanguage['Write message...']!,
                      hintStyle: const TextStyle(color: Colors.black54),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                const SizedBox(
                  width: 15,
                ),
                FloatingActionButton(
                  heroTag: 'sendChat',
                  onPressed: (!isTextFieldEmpty)
                      ? () {
                          chatState.sendUserMessage(textFieldController.text);
                          textFieldController.clear();
                        }
                      : null,
                  backgroundColor:
                      (!isTextFieldEmpty) ? themeState.currentTheme['Blue Background']: Colors.grey,
                  elevation: 0,
                  child: Icon(
                    Icons.send,
                    color: themeState.currentTheme['Button foreground'],
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
