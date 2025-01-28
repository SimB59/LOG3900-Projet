import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/accounts-page/accounts-state.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:provider/provider.dart';

class AccountListItem extends StatefulWidget {
  final AccountData account;
  final AccountsState accountsState;

  const AccountListItem(
      {super.key, required this.account, required this.accountsState});

  @override
  State<AccountListItem> createState() => _AccountListItemState();
}

class _AccountListItemState extends State<AccountListItem> {
  bool isFriendButtonVisible = true;
  bool isBlockedButtonVisible = true;
  bool isUnBlockedButtonVisible = false;
  late AccountFriendService accountFriendService;

  late Future<Widget> _avatarFuture;

  @override
  void initState() {
    super.initState();
    _avatarFuture =
        AccountService.setOtherAccountAvatar(widget.account.accountId);
  }

  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    accountFriendService = context.watch<AccountFriendService>();
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/other/profile',
          arguments: {
            'accountId': widget.account.accountId,
            'pseudo': widget.account.pseudo,
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
            widget.account.pseudo,
            style:
                TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isFriendButtonVisible &&
                  !(accountFriendService.accountFriendData.friendList
                          .contains(FriendData(
                        accountId: widget.account.accountId,
                        pseudo: widget.account.pseudo,
                      )) ||
                      accountFriendService.accountFriendData.requestSentList
                          .contains(FriendData(
                        accountId: widget.account.accountId,
                        pseudo: widget.account.pseudo,
                      )) ||
                      accountFriendService.accountFriendData.receivedRequestList
                          .contains(FriendData(
                        accountId: widget.account.accountId,
                        pseudo: widget.account.pseudo,
                      )) ||
                      accountFriendService.accountFriendData.blockedList
                          .contains(FriendData(
                        accountId: widget.account.accountId,
                        pseudo: widget.account.pseudo,
                      ))))
                IconButton(
                  icon: Icon(
                    Icons.group_add,
                    color: themeState.currentTheme['Button foreground'],
                  ),
                  onPressed: () {
                    // Add friend request functionality
                    widget.accountsState.sendFriendRequest(
                      [
                        FriendData(
                            accountId: AccountService.accountUserId,
                            pseudo: AccountService.accountPseudo),
                        FriendData(
                            accountId: widget.account.accountId,
                            pseudo: widget.account.pseudo)
                      ],
                    );
                    setState(() {
                      isFriendButtonVisible = false;
                    });
                  },
                  tooltip: translationState.currentLanguage['Add as friend'],
                ),
              if (isBlockedButtonVisible &&
                  (!accountFriendService.accountFriendData.blockedList
                      .contains(FriendData(
                    accountId: widget.account.accountId,
                    pseudo: widget.account.pseudo,
                  ))))
                IconButton(
                  icon: Icon(
                    Icons.block,
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
                                color: themeState
                                    .currentTheme['Button foreground']),
                          ),
                          content: Text(
                            translationState.currentLanguage[
                                'Are you sure you want to block this account?']!,
                            style: TextStyle(
                                color: themeState
                                    .currentTheme['Button foreground']),
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
                                translationState.currentLanguage['Confirm']!,
                                style: TextStyle(
                                    color: themeState
                                        .currentTheme['Button foreground']),
                              ),
                              onPressed: () {
                                widget.accountsState.sendBlockRequest(
                                  [
                                    FriendData(
                                      accountId: AccountService.accountUserId,
                                      pseudo: AccountService.accountPseudo,
                                    ),
                                    FriendData(
                                      accountId: widget.account.accountId,
                                      pseudo: widget.account.pseudo,
                                    ),
                                  ],
                                );
                                setState(() {
                                  isUnBlockedButtonVisible = true;
                                  isBlockedButtonVisible = false;
                                  isFriendButtonVisible = false;
                                });
                                Navigator.of(context).pop();
                              },
                            ),
                          ],
                        );
                      },
                    );
                  },
                  tooltip: translationState.currentLanguage['Block'],
                ),
              if (isUnBlockedButtonVisible ||
                  (accountFriendService.accountFriendData.blockedList.contains(
                      FriendData(
                          accountId: widget.account.accountId,
                          pseudo: widget.account.pseudo))))
                IconButton(
                  icon: Icon(
                    Icons.remove_circle_outline,
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
                                color: themeState
                                    .currentTheme['Button foreground']),
                          ),
                          content: Text(
                            translationState.currentLanguage[
                                'Are you sure you want to unblock this account?']!,
                            style: TextStyle(
                                color: themeState
                                    .currentTheme['Button foreground']),
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
                                widget.accountsState.sendUnBlockRequest(
                                  [
                                    FriendData(
                                      accountId: AccountService.accountUserId,
                                      pseudo: AccountService.accountPseudo,
                                    ),
                                    FriendData(
                                      accountId: widget.account.accountId,
                                      pseudo: widget.account.pseudo,
                                    ),
                                  ],
                                );
                                setState(() {
                                  isBlockedButtonVisible = true;
                                  isUnBlockedButtonVisible = false;
                                  isFriendButtonVisible = true;
                                });
                                Navigator.of(context).pop();
                              },
                            ),
                          ],
                        );
                      },
                    );
                  },
                  tooltip: translationState.currentLanguage['Block'],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
