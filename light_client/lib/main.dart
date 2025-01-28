import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/accounts-page/accounts-page.dart';
import 'package:namer_app/accounts-page/accounts-state.dart';
import 'package:namer_app/authentication-page/authentication-page.dart';
import 'package:namer_app/chat/chat-state.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/friends-systeme-page/friends-systeme-profile-page.dart';
import 'package:namer_app/game-chat/game-chat-state.dart';
import 'package:namer_app/game-page/game-page.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/limited-time/limited-time-service.dart';
import 'package:namer_app/lobby/lobby-page.dart';
import 'package:namer_app/lobby/lobby-state.dart';
import 'package:namer_app/observer-page/observer-page.dart';
import 'package:namer_app/observer-page/observer-service.dart';
import 'package:namer_app/other-profile-page/friends-system-other-profile-page.dart';
import 'package:namer_app/other-profile-page/other-friends-state.dart';
import 'package:namer_app/other-profile-page/other-profile-state.dart';
import 'package:namer_app/profile/profile-state.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:namer_app/sign-up-page/sign-up-page.dart';
import 'package:namer_app/timer/timer-service.dart';
import 'package:namer_app/video-replay-search-page/video-replay-search-page.dart';
import 'package:namer_app/video-replay-search-page/video-replay-search-state.dart';
import 'package:namer_app/video-replay/video-replay-state.dart';
import 'package:provider/provider.dart';

import '/home-page/home-page.dart';
import 'chat/chat.dart';
import 'selection-page/selection-page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    ChatState();
    GameState();
    GameChatState();
    CardsState();
    AccountsState();
    LobbyState();
    TranslationState();
    ThemeState();
    AccountFriendService();
    ProfileState();
    VideoReplayState();
    OtherProfileState();
    OtherFriendsState();
    VideoReplaySearchState();
    VideoReplayState();
    ObserverService();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused ||
        state == AppLifecycleState.resumed) return;

    if (state == AppLifecycleState.detached) {
      await logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: []);
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ChatState()),
        ChangeNotifierProvider(create: (_) => GameState()),
        ChangeNotifierProvider(create: (_) => GameChatState()),
        ChangeNotifierProvider(create: (_) => CardsState()),
        ChangeNotifierProvider(create: (_) => AccountsState()),
        ChangeNotifierProvider(create: (_) => LobbyState()),
        ChangeNotifierProvider(create: (_) => TranslationState()),
        ChangeNotifierProvider(create: (_) => ThemeState()),
        ChangeNotifierProvider(create: (_) => AccountFriendService()),
        ChangeNotifierProvider(create: (_) => ProfileState()),
        ChangeNotifierProvider(create: (_) => OtherProfileState()),
        ChangeNotifierProvider(create: (_) => OtherFriendsState()),
        ChangeNotifierProvider(create: (_) => LimitedTimeService()),
        ChangeNotifierProvider(create: (_) => TimerService()),
        ChangeNotifierProvider(create: (_) => VideoReplaySearchState()),
        ChangeNotifierProvider(create: (_) => VideoReplayState()),
        ChangeNotifierProvider(create: (_) => ObserverService()),
      ],
      child: MaterialApp(
        navigatorKey: MyApp.navigatorKey,
        title: 'Flutter Demo',
        theme: ThemeData(
          useMaterial3: true,
        ),
        initialRoute: '/login',
        routes: {
          '/login': (context) => const AuthenticationPage(),
          '/home': (context) => const HomePage(),
          '/options': (context) => const SelectionPage(),
          '/chat': (context) => const ChatPage(),
          '/game': (context) => const GamePage(),
          '/sign-up': (context) => const SignUpPage(),
          '/profile': (context) => const FriendsSystemProfilePage(),
          '/lobby': (context) => const LobbyPage(),
          '/accounts': (context) => const AccountsPage(),
          '/video': (context) => const VideoReplaySearchPage(),
          '/other/profile': (context) {
            final arguments = ModalRoute.of(context)!.settings.arguments;
            if (arguments != null && arguments is Map<String, dynamic>) {
              return FriendsSystemOtherProfilePage(
                accountId: arguments['accountId'] as String,
                pseudo: arguments['pseudo'] as String,
              );
            } else {
              return const FriendsSystemOtherProfilePage(
                  accountId: '', pseudo: '');
            }
          },
          '/observer': (context) => const ObserverPage(),
        },
      ),
    );
  }
}
