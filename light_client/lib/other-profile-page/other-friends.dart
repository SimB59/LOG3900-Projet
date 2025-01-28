import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:provider/provider.dart';
class OtherFriendListItem extends StatelessWidget {
  final FriendData friend;

  const OtherFriendListItem({super.key, required this.friend});

  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/other/profile',
          arguments: {
            'accountId': friend.accountId,
            'pseudo': friend.pseudo,
          },
        );
      },
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Colors.grey.withOpacity(0.5), 
            width: 1.0, 
          ),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: ListTile(
          leading: SizedBox(
            width: 40.0,
            height: 40.0,
            child: Padding(
              padding: const EdgeInsets.all(2.0),
              child: ClipOval(
                child: FittedBox(
                  fit: BoxFit.cover,
                  child: Image.network(
                    '${getServerUrlApi()}/image/avatar/${friend.accountId}',
                  ),
                ),
              ),
            ),
          ),
          title: Text(friend.pseudo, style: TextStyle(color: themeState.currentTheme['Button foreground']),)
        ),
      ),
    );
  }
}