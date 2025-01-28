import 'package:flutter/material.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/chat-button.dart';
import 'package:namer_app/common-widgets/gradient-background.dart';
import 'package:namer_app/video-replay-search-page/video-replay-public.dart';
import 'package:namer_app/video-replay-search-page/video-replay-search-state.dart';
import 'package:namer_app/video-replay-search-page/video-replay.dart';
import 'package:provider/provider.dart';

enum SearchType { Creator, Card }

class VideoReplaySearchPage extends StatefulWidget {
  const VideoReplaySearchPage({super.key});

  @override
  State<VideoReplaySearchPage> createState() => _VideoReplaySearchState();
}

class _VideoReplaySearchState extends State<VideoReplaySearchPage> {
  TextEditingController textFieldController = TextEditingController();

  SearchType _currentSearchType = SearchType.Creator;
  bool isTextFieldEmpty = true;
  late VideoReplaySearchState videoReplaySearchState;
  late TranslationState translationState;
  late ThemeState themeState;
  bool isPersonalVideoReplay = false;
  bool isInitialization = true;

  @override
  void initState() {
    super.initState();
    textFieldController.addListener(_textFieldValueChanged);
    VideoReplaySearchState videoReplayStateTemp = VideoReplaySearchState();
    videoReplayStateTemp.getSearchedVideoReplaysPlayerName('');
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

  void _onSearchTypeChanged(SearchType newType) {
    setState(() {
      _currentSearchType = newType;
    });
  }

  void _performSearch(String query) {
    // Implement your search logic here based on _currentSearchType and query
    switch (_currentSearchType) {
      case SearchType.Creator:
        VideoReplaySearchState videoReplayStateTemp = VideoReplaySearchState();
        videoReplayStateTemp.getSearchedVideoReplaysPlayerName(query);
        break;
      case SearchType.Card:
        VideoReplaySearchState videoReplayStateTemp = VideoReplaySearchState();
        videoReplayStateTemp.getSearchedVideoReplaysCardName(query);
        break;
      default:
        // Perform search for products
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isInitialization) {
      videoReplaySearchState = context.watch<VideoReplaySearchState>();
      translationState = context.watch<TranslationState>();
      themeState = context.watch<ThemeState>();
      isInitialization = false;
    }

    return LayoutBuilder(builder: (context, constraints) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: themeState.currentTheme['Background app bar'],
            leading: IconButton(
              icon: Icon(Icons.home, color: themeState.currentTheme['Button foreground'],),
              onPressed: () {
                Navigator.of(context).pushNamed('/home');
              },
            ),
            title: Text(translationState.currentLanguage['Video Replay']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
            actions: [
              TextButton(
                onPressed: () {
                  setState(() {
                    isPersonalVideoReplay = false;
                    videoReplaySearchState
                        .getSearchedVideoReplaysPlayerName('');
                  });
                },
                child: Text(translationState.currentLanguage['Public']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),), // Use Text widget for the button label
                style: ButtonStyle(
                  foregroundColor: MaterialStateProperty.resolveWith<Color>(
                    (Set<MaterialState> states) {
                      return (!isPersonalVideoReplay)
                          ? themeState.currentTheme['Blue icon'] : Colors.grey;
                    },
                  ),
                ),
              ),
              TextButton(
                onPressed: () {
                  videoReplaySearchState
                      .getPersonalVideoReplays(AccountService.accountUserId);
                  setState(() {
                    isPersonalVideoReplay = true;
                  });
                },
                child: Text(translationState.currentLanguage['Private']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                style: ButtonStyle(
                  foregroundColor: MaterialStateProperty.resolveWith<Color>(
                    (Set<MaterialState> states) {
                      return (isPersonalVideoReplay)
                          ? themeState.currentTheme['Blue icon'] : Colors.grey;
                    },
                  ),
                ),
              )
            ]),
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
                Visibility(
                  visible: !isPersonalVideoReplay,
                  child: Container(
                    padding:
                        const EdgeInsets.only(left: 10, bottom: 10, top: 10),
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
                            controller: textFieldController,
                            decoration: InputDecoration(
                                hintText: translationState
                                    .currentLanguage['Write message...'],
                                hintStyle:
                                    const TextStyle(color: Colors.black54),
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
                                  _performSearch(textFieldController.text);
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
                        SizedBox(width: 10),
                        DropdownButton<SearchType>(
                          value: _currentSearchType,
                          onChanged: (SearchType? newType) =>
                              _onSearchTypeChanged(newType!),
                          items: SearchType.values
                              .map<DropdownMenuItem<SearchType>>(
                                (type) => DropdownMenuItem(
                                  value: type,
                                  child: Text(translationState.currentLanguage[type.toString().split('.').last]!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                                ),
                              )
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Builder(builder: (context) {
                  if (isPersonalVideoReplay) {
                    if (videoReplaySearchState
                        .personalVideoReplays.isNotEmpty) {
                      return Expanded(
                        child: ListView.separated(
                          itemCount: (isPersonalVideoReplay)
                              ? videoReplaySearchState
                                  .personalVideoReplays.length
                              : videoReplaySearchState.videoReplays.length,
                          separatorBuilder: (context, index) => const SizedBox(
                            height: 8,
                          ),
                          itemBuilder: (BuildContext context, int index) {
                            final reversedIndex = ((isPersonalVideoReplay)
                                    ? videoReplaySearchState
                                        .personalVideoReplays.length
                                    : videoReplaySearchState
                                        .videoReplays.length) -
                                1 -
                                index;
                            return (isPersonalVideoReplay)
                                ? VideoReplayListItem(
                                    videoReplayData: videoReplaySearchState
                                        .personalVideoReplays[reversedIndex],
                                    videoReplaySearchState:
                                        videoReplaySearchState,
                                  )
                                : VideoReplayPublicListItem(
                                    videoReplayData: videoReplaySearchState
                                        .videoReplays[reversedIndex],
                                    videoReplaySearchState:
                                        videoReplaySearchState);
                          },
                        ),
                      );
                    } else {
                      return Expanded(
                        child: Center(
                          child: Text(
                            translationState.currentLanguage[
                                'No replays available to play!']!,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                                color: themeState.currentTheme['Button foreground'],
                              fontSize: 30,
                            ),
                          ),
                        ),
                      );
                    }
                  } else {
                    if (videoReplaySearchState.videoReplays.isNotEmpty) {
                      return Expanded(
                        child: ListView.separated(
                          itemCount: (isPersonalVideoReplay)
                              ? videoReplaySearchState
                                  .personalVideoReplays.length
                              : videoReplaySearchState.videoReplays.length,
                          separatorBuilder: (context, index) => const SizedBox(
                            height: 8,
                          ),
                          itemBuilder: (BuildContext context, int index) {
                            final reversedIndex = ((isPersonalVideoReplay)
                                    ? videoReplaySearchState
                                        .personalVideoReplays.length
                                    : videoReplaySearchState
                                        .videoReplays.length) -
                                1 -
                                index;
                            return (isPersonalVideoReplay)
                                ? VideoReplayListItem(
                                    videoReplayData: videoReplaySearchState
                                        .personalVideoReplays[reversedIndex],
                                    videoReplaySearchState:
                                        videoReplaySearchState,
                                  )
                                : VideoReplayPublicListItem(
                                    videoReplayData: videoReplaySearchState
                                        .videoReplays[reversedIndex],
                                    videoReplaySearchState:
                                        videoReplaySearchState);
                          },
                        ),
                      );
                    } else {
                      return Expanded(
                        child: Center(
                          child: Text(
                            translationState.currentLanguage[
                                'No replays available to play!']!,
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
                }),
                const SizedBox(height: 8)
              ],
            ),
          ),
        ),
        floatingActionButton: chatButton(context),
      );
    });
  }
}
