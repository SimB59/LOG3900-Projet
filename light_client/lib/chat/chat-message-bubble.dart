import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/general-classes/ChatEntry.dart';
import 'package:provider/provider.dart';

class MessageBubble extends StatelessWidget {
  const MessageBubble({Key? key, required this.chat}) : super(key: key);
  final ChatEntry chat;

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: LayoutBuilder(builder: (context, constraints) {
        return Row(
          children: [
            if (chat.playerName == AccountService.accountPseudo/* || chat.type == ChatEntryType.GLOBAL*/) const Spacer(),
            ConstrainedBox(
              constraints: BoxConstraints(maxWidth: constraints.maxWidth),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: (chat.playerName == AccountService.accountPseudo)
                      ? themeState.currentTheme['Blue Background']
                      : Colors.grey,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    '${chat.timestamp} - ${chat.playerName} - ${chat.message}',
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: (chat.playerName == AccountService.accountPseudo)
                            ? Colors.white
                            : themeState.currentTheme['Button foreground']),
                  ),
                ),
              ),
            ),
            if (chat.playerName != AccountService.accountPseudo) const Spacer(),
          ],
        );
      }),
    );
  }
}
