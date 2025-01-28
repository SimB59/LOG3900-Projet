import 'package:flutter/material.dart';
import 'package:namer_app/accounts-page/accounts-page.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/chat-button.dart';
import 'package:namer_app/friends-page/friends-page.dart';
import 'package:namer_app/friends-request-page/friends-request-page.dart';
import 'package:namer_app/profile/profile-page.dart';
import 'package:provider/provider.dart';

class FriendsSystemProfilePage extends StatefulWidget {
  const FriendsSystemProfilePage({Key? key}) : super(key: key);

  @override
  State<FriendsSystemProfilePage> createState() =>
      _FriendsSystemProfilePageState();
}

class _FriendsSystemProfilePageState extends State<FriendsSystemProfilePage> {
  int _currentPageIndex = 0;
  final String leftRoute = '/home';
  late String currentTitle;

  Widget _buildBody() {
    switch (_currentPageIndex) {
      case 0:
        currentTitle = 'Profile';
        return const ProfilePage();
      case 1:
        currentTitle = 'Friends';
        return const FriendsPage();
      case 2:
        currentTitle = 'Friend requests';
        return const FriendsRequestPage();
      case 3:
        currentTitle = 'Search';
        return const AccountsPage();
      default:
        return Container(); // Handle any other cases as needed
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
          icon: Icon(Icons.home, color: themeState.currentTheme['Button foreground'],),
          onPressed: () {
            Navigator.of(context).pushReplacementNamed(leftRoute);
          },
        ),
        title: Text(((_currentPageIndex == 0 || _currentPageIndex == 1) ? (_currentPageIndex == 0) ? translationState.currentLanguage['Profile Page']! : translationState.currentLanguage['Friends']! : (_currentPageIndex == 2) ? translationState.currentLanguage['Friend requests']! : translationState.currentLanguage['Search']!), style: TextStyle(color: themeState.currentTheme['Button foreground']),),
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                _currentPageIndex = 0;
              });
            },
            icon: const Icon(Icons.portrait),
            color: _currentPageIndex == 0 ? themeState.currentTheme['Blue icon'] : Colors.grey,
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _currentPageIndex = 1;
              });
            },
            icon: const Icon(Icons.people),
            color: _currentPageIndex == 1 ? themeState.currentTheme['Blue icon'] : Colors.grey,
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _currentPageIndex = 2;
              });
            },
            icon: const Icon(Icons.group_add),
            color: _currentPageIndex == 2 ? themeState.currentTheme['Blue icon'] : Colors.grey,
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _currentPageIndex = 3;
              });
            },
            icon: const Icon(Icons.search),
            color: _currentPageIndex == 3 ? themeState.currentTheme['Blue icon'] : Colors.grey,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: chatButton(context),
    );
  }
}
