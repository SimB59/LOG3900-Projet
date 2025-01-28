import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:provider/provider.dart';

class FriendRequestListItem extends StatefulWidget {
  final FriendData friend;
  final AccountFriendService friendState;

  const FriendRequestListItem(
      {super.key, required this.friend, required this.friendState});

  @override
  State<FriendRequestListItem> createState() => _FriendRequestListItemState();
}

class _FriendRequestListItemState extends State<FriendRequestListItem> {
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
                  Icons.check,
                  color: themeState.currentTheme['Button foreground'],
                ),
                onPressed: () {
                  // Add friend request functionality
                  widget.friendState.acceptFriendRequest([
                    FriendData(
                        accountId: AccountService.accountUserId,
                        pseudo: AccountService.accountPseudo),
                    FriendData(
                        accountId: widget.friend.accountId,
                        pseudo: widget.friend.pseudo)
                  ]);
                },
                tooltip: translationState.currentLanguage['Accept'],
              ),
              IconButton(
                icon: Icon(
                  Icons.close,
                  color: themeState.currentTheme['Button foreground'],
                ),
                onPressed: () {
                  // Add blocked functionality
                  widget.friendState.refuseFriendRequest([
                    FriendData(
                        accountId: AccountService.accountUserId,
                        pseudo: AccountService.accountPseudo),
                    FriendData(
                        accountId: widget.friend.accountId,
                        pseudo: widget.friend.pseudo)
                  ]);
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
