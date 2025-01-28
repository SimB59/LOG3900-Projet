import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/other-profile-page/other-profile-state.dart';
import 'package:namer_app/profile/connexion-history.dart';
import 'package:namer_app/profile/game-history.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class OtherProfilePage extends StatefulWidget {
  final String pseudo;
  final String accountId;
  const OtherProfilePage(
      {super.key, required this.accountId, required this.pseudo});

  @override
  State<OtherProfilePage> createState() => _OtherProfilePageState();
}

const int MAX_LENGTH_PSEUDO = 40;

class _OtherProfilePageState extends State<OtherProfilePage> {
  final TextEditingController _pseudoController = TextEditingController();
  bool _showValidationError = false;
  late Future<Widget> _avatarFuture;

  final String leftRoute = '/home';
  final String rightRoute = '/profile';

  @override
  void initState() {
    super.initState();
    _avatarFuture = AccountService.setOtherAccountAvatar(widget.accountId);
    OtherProfileState otherProfileStateTemp = OtherProfileState();
    otherProfileStateTemp.getAccountActivity(widget.accountId);
    otherProfileStateTemp.getGameHistory(widget.accountId);
    otherProfileStateTemp.getProfileData(widget.accountId);
  }

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    var otherProfileState = context.watch<OtherProfileState>();
    var translationState = context.watch<TranslationState>();
    return Scaffold(
      body: Container(
        decoration: gradientBackground(themeState),
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Column(
            children: <Widget>[
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2.0),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const SizedBox(width: 5),
                    Column(
                      children: [
                        Text(
                          getAccountPseudo(),
                          style: TextStyle(
                              color:
                                  themeState.currentTheme['Button foreground']),
                        ),
                        FutureBuilder<Widget>(
                          future: _avatarFuture,
                          builder: (context, snapshot) {
                            if (snapshot.connectionState ==
                                ConnectionState.waiting) {
                              return const CircularProgressIndicator();
                            } else if (snapshot.hasError) {
                              return Text(
                                '${translationState.currentLanguage['Error']!}: ${snapshot.error}',
                                style: TextStyle(
                                    color: themeState
                                        .currentTheme['Button foreground']),
                              );
                            } else {
                              return SizedBox(
                                width: 200.0,
                                height: 200.0,
                                child: Padding(
                                  padding: const EdgeInsets.all(2.0),
                                  child: ClipOval(
                                    child: FittedBox(
                                      fit: BoxFit.cover,
                                      child: snapshot.data ??
                                          const CircularProgressIndicator(),
                                    ),
                                  ),
                                ),
                              );
                            }
                          },
                        ),
                        Text(
                          '${translationState.currentLanguage['Level']} ${(AccountService.level / 2).floor() + 1} (${AccountService.findAccountRankName(AccountService.rank)})',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: themeState.currentTheme['Button foreground'],
                          ),
                        ),
                      ],
                    ),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          children: <Widget>[
                            Expanded(
                              child: Column(
                                children: <Widget>[
                                  Center(
                                    child: Text(
                                      translationState
                                          .currentLanguage['Username']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    widget.pseudo,
                                    style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground']),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                children: <Widget>[
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Number of games played']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${otherProfileState.amountOfGamesPlayed}',
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Number of games won']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${otherProfileState.amountOfGamesWon}',
                                    style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground']),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                children: <Widget>[
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Average time per game']!,
                                      style: TextStyle(
                                          color: themeState.currentTheme[
                                              'Button foreground']),
                                    ),
                                  ),
                                  Text(
                                    otherProfileState.averageTimePerGame
                                        .toStringAsFixed(2),
                                    style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground']),
                                  ),
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Average differences found per game']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    otherProfileState
                                        .averageDifferencesFoundPerGame
                                        .toStringAsFixed(2),
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16.0),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height * 0.40,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Container(
                            decoration: BoxDecoration(
                              border:
                                  Border.all(color: Colors.white, width: 2.0),
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(1.0),
                              child: Text(
                                translationState.currentLanguage['Activity']!,
                                style: TextStyle(
                                    color: themeState
                                        .currentTheme['Button foreground']),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.4,
                              height: MediaQuery.of(context).size.height * 0.35,
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.white, width: 2.0),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: ListView.separated(
                                separatorBuilder: (context, index) =>
                                    const SizedBox(
                                  height: 8,
                                ),
                                itemCount: otherProfileState.activity.length,
                                itemBuilder: (context, index) {
                                  final reversedIndex =
                                      otherProfileState.activity.length -
                                          1 -
                                          index;
                                  return ActivityListItem(
                                      activityInstance: otherProfileState
                                          .activity[reversedIndex]);
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.1,
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Container(
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.white, width: 2.0),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(1.0),
                                child: Text(
                                  translationState
                                      .currentLanguage['Game history']!,
                                  style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground']),
                                ),
                              )),
                          const SizedBox(height: 8),
                          Expanded(
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.4,
                              height: MediaQuery.of(context).size.height * 0.35,
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.white, width: 2.0),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: ListView.separated(
                                separatorBuilder: (context, index) =>
                                    const SizedBox(
                                  height: 8,
                                ),
                                itemCount: otherProfileState.gameHistory.length,
                                itemBuilder: (context, index) {
                                  final reversedIndex =
                                      otherProfileState.gameHistory.length -
                                          1 -
                                          index;
                                  return GameHistoryListItem(
                                    gameHistoryInstance: otherProfileState
                                        .gameHistory[reversedIndex],
                                  );
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pseudoController.dispose();
    super.dispose();
  }
}
