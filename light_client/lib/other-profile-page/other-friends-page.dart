import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/gradient-background.dart';
import 'package:namer_app/other-profile-page/other-friends-state.dart';
import 'package:namer_app/other-profile-page/other-friends.dart';
import 'package:provider/provider.dart';

class OtherFriendsPage extends StatefulWidget {
  final String accountId;
  final String pseudo;
  const OtherFriendsPage({super.key, required this.accountId, required this.pseudo});

  @override
  State<OtherFriendsPage> createState() => _OtherFriendsState();
}

class _OtherFriendsState extends State<OtherFriendsPage> {
  
  @override
  void initState() {
    super.initState();
    //call get friend request
    OtherFriendsState otherProfileStateTemp = OtherFriendsState();
    otherProfileStateTemp.getAccountFriends([widget.accountId, AccountService.accountUserId]);
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
    var otherFriendsState = context.watch<OtherFriendsState>();

    return LayoutBuilder(builder: (context, constraints){
      return Scaffold(
        body: Container(
          constraints: BoxConstraints(maxHeight: constraints.maxHeight, maxWidth: constraints.maxWidth),
          decoration: gradientBackground(themeState),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                const SizedBox(height: 8),
                Builder(
                  builder: (context) {
                    if(otherFriendsState.friends.isNotEmpty){
                      return Expanded(
                        child: ListView.separated(
                          itemCount: otherFriendsState.friends.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 8,),
                          itemBuilder: (BuildContext context, int index) {
                            final reversedIndex = otherFriendsState.friends.length - 1 - index;
                            return OtherFriendListItem(friend: otherFriendsState.friends[reversedIndex]);
                          },
                        ),
                      );
                    } else{
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
                const SizedBox(height: 8,)
              ],
            ),
          ),
        ),
      );
    }
    );

  }
}