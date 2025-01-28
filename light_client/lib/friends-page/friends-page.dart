import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/gradient-background.dart';
import 'package:namer_app/friends-page/friends.dart';
import 'package:provider/provider.dart';

class FriendsPage extends StatefulWidget {
  const FriendsPage({super.key});

  @override
  State<FriendsPage> createState() => _FriendsState();
}

class _FriendsState extends State<FriendsPage> {
  @override
  void initState() {
    super.initState();
    //call get friend request
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    //var friendsState = context.watch<FriendsRequestState>();
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    var accountFriendsService = context.watch<AccountFriendService>();

    return LayoutBuilder(builder: (context, constraints) {
      return Scaffold(
        body: Container(
          constraints: BoxConstraints(
              maxHeight: constraints.maxHeight, maxWidth: constraints.maxWidth),
          decoration: gradientBackground(themeState),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                const SizedBox(height: 8),
                Builder(
                  builder: (context) {
                    if(accountFriendsService.accountFriendData.friendList.isNotEmpty) {
                      return Expanded(
                        child: ListView.separated(
                          itemCount: accountFriendsService
                              .accountFriendData.friendList.length,
                          separatorBuilder: (context, index) => const SizedBox(
                            height: 8,
                          ),
                          itemBuilder: (BuildContext context, int index) {
                            final reversedIndex = accountFriendsService
                                    .accountFriendData.friendList.length -
                                1 -
                                index;
                            return FriendListItem(
                              friend: accountFriendsService
                                  .accountFriendData.friendList[reversedIndex],
                              friendState: accountFriendsService,
                            );
                          },
                        ),
                      );
                    } else {
                      return Expanded(
                          child: Center(
                            child: Text(
                              translationState
                                  .currentLanguage['No friend to show']!,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: themeState.currentTheme['Button foreground'],
                                fontSize: 30,
                              ),
                            ),
                          ),
                        );
                    }
                  }
                ),
                const SizedBox(
                  height: 8,
                )
              ],
            ),
          ),
        ),
      );
    });
  }
}
