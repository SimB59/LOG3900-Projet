import 'package:flutter/material.dart';
import 'package:namer_app/chat/chat-state.dart';
import 'package:namer_app/chat/chat.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/game-chat/game-chat-state.dart';
import 'package:provider/provider.dart';

Stack chatButton(BuildContext context) {
  var chatState = context.watch<ChatState>();
  var gameState = context.watch<GameChatState>();
  var themeState = context.watch<ThemeState>();
  return Stack(
    children: [
      FloatingActionButton(
        heroTag: 'chatButton',
        onPressed: () {
          showDialog(
            barrierDismissible: false,
            context: context,
            builder: (BuildContext context) {
              return const ChatPage();
            },
          );
        },
        child: Icon(
          Icons.chat,
          color: themeState.currentTheme['Button foreground'],
        ),
      ),
      Visibility(
        visible: (gameState.hasNotification) || (chatState.hasNotification),
        child: Positioned(
          right: 0,
          top: 0,
          child: Container(
            height: 15,
            width: 15,
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ),
    ],
  );
}
