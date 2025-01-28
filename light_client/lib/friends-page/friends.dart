import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:provider/provider.dart';

class FriendListItem extends StatefulWidget {
  final FriendData friend;
  final AccountFriendService friendState;

  const FriendListItem(
      {super.key, required this.friend, required this.friendState});

  @override
  State<FriendListItem> createState() => _FriendListItemState();
}

class _FriendListItemState extends State<FriendListItem> {
  late Future<Widget> _avatarFuture;

  @override
  void initState() {
    super.initState();
    _avatarFuture =
        AccountService.setOtherAccountAvatar(widget.friend.accountId);
  }

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
            'accountId': widget.friend.accountId,
            'pseudo': widget.friend.pseudo,
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
          leading: FutureBuilder<Widget>(
            future: _avatarFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const CircularProgressIndicator();
              } else if (snapshot.hasError) {
                return Text(
                  '${translationState.currentLanguage['Error']!}: ${snapshot.error}',
                  style: TextStyle(
                      color: themeState.currentTheme['Button foreground']),
                );
              } else {
                return SizedBox(
                  width: 40.0,
                  height: 40.0,
                  child: Padding(
                    padding: const EdgeInsets.all(2.0),
                    child: ClipOval(
                      child: FittedBox(
                        fit: BoxFit.cover,
                        child:
                            snapshot.data ?? const CircularProgressIndicator(),
                      ),
                    ),
                  ),
                );
              }
            },
          ),
          title: Text(
            widget.friend.pseudo,
            style:
                TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: Icon(
                  Icons.close,
                  color: themeState.currentTheme['Button foreground'],
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        backgroundColor:
                            themeState.currentTheme['Dialog Background'],
                        title: Text(
                          translationState.currentLanguage['Confirm action']!,
                          style: TextStyle(
                              color:
                                  themeState.currentTheme['Button foreground']),
                        ),
                        content: Text(
                          translationState.currentLanguage[
                              'Are you sure you want to remove this friend?']!,
                          style: TextStyle(
                              color:
                                  themeState.currentTheme['Button foreground']),
                        ),
                        actions: <Widget>[
                          TextButton(
                            child: Text(
                              translationState.currentLanguage["Cancel"]!,
                              style: TextStyle(
                                  color: themeState
                                      .currentTheme['Button foreground']),
                            ),
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                          ),
                          TextButton(
                            child: Text(
                              translationState.currentLanguage["Confirm"]!,
                              style: TextStyle(
                                  color: themeState
                                      .currentTheme['Button foreground']),
                            ),
                            onPressed: () {
                              widget.friendState.removeFriend([
                                FriendData(
                                  accountId: AccountService.accountUserId,
                                  pseudo: AccountService.accountPseudo,
                                ),
                                FriendData(
                                  accountId: widget.friend.accountId,
                                  pseudo: widget.friend.pseudo,
                                ),
                              ]);
                              Navigator.of(context).pop();
                            },
                          ),
                        ],
                      );
                    },
                  );
                },
                tooltip: translationState.currentLanguage['Refuse'],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
