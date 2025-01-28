import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/chat-button.dart';
import 'package:namer_app/other-profile-page/other-friends-page.dart';
import 'package:namer_app/other-profile-page/other-profile-page.dart';
import 'package:provider/provider.dart';

class FriendsSystemOtherProfilePage extends StatefulWidget {
  final String accountId;
  final String pseudo;
  const FriendsSystemOtherProfilePage(
      {Key? key, required this.accountId, required this.pseudo})
      : super(key: key);

  @override
  State<FriendsSystemOtherProfilePage> createState() =>
      _FriendsSystemProfilePageState();
}

class _FriendsSystemProfilePageState
    extends State<FriendsSystemOtherProfilePage> {
  int _currentPageIndex = 0;
  final String leftRoute = '/home';
  String currentTitle = 'Profile';

  Widget _buildBody() {
    switch (_currentPageIndex) {
      case 0:
        currentTitle = "${widget.pseudo}'s profile";
        return OtherProfilePage(
            accountId: widget.accountId, pseudo: widget.pseudo);
      case 1:
        currentTitle = "${widget.pseudo}'s friends";
        return OtherFriendsPage(
            accountId: widget.accountId, pseudo: widget.pseudo);
      default:
        return Container();
    }
  }

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    var translationState = context.watch<TranslationState>();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: themeState.currentTheme['Background app bar'],
        leading: IconButton(
          icon: Icon(
            Icons.home,
            color: themeState.currentTheme['Button foreground'],
          ),
          onPressed: () {
            Navigator.of(context).pushNamed(leftRoute);
          },
        ),
        title: Text(
          ((_currentPageIndex == 0)
              ? "${translationState.currentLanguage['Profil de']} ${widget.pseudo}${translationState.currentLanguage["'s profile"]}"
              : "${translationState.currentLanguage['Amis de']}${widget.pseudo}${translationState.currentLanguage["'s friends"]}"),
          style: TextStyle(color: themeState.currentTheme['Button foreground']),
        ),
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                _currentPageIndex = 0;
              });
            },
            icon: const Icon(Icons.portrait),
            color: _currentPageIndex == 0
                ? themeState.currentTheme['Blue icon']
                : Colors.grey,
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _currentPageIndex = 1;
              });
            },
            icon: const Icon(Icons.people),
            color: _currentPageIndex == 1
                ? themeState.currentTheme['Blue icon']
                : Colors.grey,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: chatButton(context),
    );
  }
}
