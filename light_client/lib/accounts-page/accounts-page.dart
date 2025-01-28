import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/accounts-page/accounts-state.dart';
import 'package:namer_app/accounts-page/accounts.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/gradient-background.dart';
import 'package:provider/provider.dart';

class AccountsPage extends StatefulWidget {
  const AccountsPage({super.key});

  @override
  State<AccountsPage> createState() => _AccountsState();
}

class _AccountsState extends State<AccountsPage> {
  TextEditingController textFieldController = TextEditingController();
  bool isTextFieldEmpty = true;
  late AccountsState accountsState;
  late TranslationState translationState;
  late ThemeState themeState;
  late AccountFriendService accountFriendService;
  bool isInitialization = true;

  @override
  void initState() {
    super.initState();
    textFieldController.addListener(_textFieldValueChanged);
    AccountsState accountsStateTemp = AccountsState();
    accountsStateTemp.getSearchedFriends(['', AccountService.accountUserId]);
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
    if (isInitialization) {
      accountsState = context.watch<AccountsState>();
      accountFriendService = context.watch<AccountFriendService>();
      translationState = context.watch<TranslationState>();
      themeState = context.watch<ThemeState>();
      isInitialization = false;
    }

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
                const SizedBox(
                  height: 8,
                ),
                Container(
                  padding: const EdgeInsets.only(left: 10, bottom: 10, top: 10),
                  //height: 60,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: <Widget>[
                      const SizedBox(width: 15),
                      Expanded(
                        child: TextField(
                          maxLines: null,
                          controller: textFieldController,
                          decoration: InputDecoration(
                              hintText: translationState
                                  .currentLanguage['Write message...'],
                              hintStyle: const TextStyle(color: Colors.black54),
                              border: InputBorder.none),
                        ),
                      ),
                      const SizedBox(
                        width: 15,
                      ),
                      FloatingActionButton(
                        heroTag: 'search',
                        onPressed: (!isTextFieldEmpty)
                            ? () {
                                accountsState.getSearchedFriends([
                                  textFieldController.text,
                                  AccountService.accountUserId
                                ]);
                                textFieldController.clear();
                              }
                            : null,
                        backgroundColor:
                            (!isTextFieldEmpty) ? themeState.currentTheme['Blue Background'] : Colors.grey,
                        elevation: 0,
                        child: const Icon(
                          Icons.search,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Builder(
                  builder: (context) {
                    if(accountsState.friends.isNotEmpty){
                      return Expanded(
                        child: ListView.separated(
                          itemCount: accountsState.friends.length,
                          separatorBuilder: (context, index) => const SizedBox(
                            height: 8,
                          ),
                          itemBuilder: (BuildContext context, int index) {
                            final reversedIndex =
                                accountsState.friends.length - 1 - index;
                            return AccountListItem(
                              account: accountsState.friends[reversedIndex],
                              accountsState: accountsState,);
                          },
                        ),
                      );
                    } else {
                        return Expanded(
                          child: Center(
                            child: Text(
                              translationState
                                  .currentLanguage['No player found']!,
                              style:  TextStyle(
                                color: themeState.currentTheme['Button foreground'],
                                fontWeight: FontWeight.bold,
                                fontSize: 30,
                              ),
                            ),
                          ),
                        );

                    }
                  }
                ),
                const SizedBox(height: 8)
              ],
            ),
          ),
        ),
      );
    });
  }
}
