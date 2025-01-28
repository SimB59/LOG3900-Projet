import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/video-replay-data.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:namer_app/video-replay-search-page/video-replay-search-state.dart';
import 'package:namer_app/video-replay/video-replay-state.dart';
import 'package:provider/provider.dart';

class VideoReplayListItem extends StatefulWidget {
  final VideoReplayData videoReplayData;
  final VideoReplaySearchState videoReplaySearchState;

  const VideoReplayListItem(
      {super.key, required this.videoReplayData, required this.videoReplaySearchState});

  @override
  State<VideoReplayListItem> createState() => _VideoReplayListItemState();
}

class _VideoReplayListItemState extends State<VideoReplayListItem> {
  late bool isPublicButtonVisible;
  late bool isPrivateButtonVisible;
  

    @override
  void initState() {
    super.initState();
    isPrivateButtonVisible = widget.videoReplayData.isPublic;
    isPublicButtonVisible = !widget.videoReplayData.isPublic;
  }
  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
    return GestureDetector(
      onTap: () {
        VideoReplayState videoReplayState = VideoReplayState();
        CardsState cardsState = CardsState();
        GameState gameState = GameState();
        videoReplayState.events = widget.videoReplayData.gameEvents;
        //gameState.reset();
        gameState.isReplay = true;
        videoReplayState.isVideoReplayDialog = true;
        videoReplayState.changeIsReplayButtonActive(false);
        videoReplayState.replay(cardsState.getCardById(widget.videoReplayData.cardId), widget.videoReplayData.constants, 0);
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
          title: Row(
            children: [
              Text(
                widget.videoReplayData.cardName,
                style: TextStyle(color: themeState.currentTheme['Button foreground']),
              ),
              Text(widget.videoReplayData.pseudo, style: TextStyle(color: themeState.currentTheme['Button foreground']))
            ],
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(widget.videoReplayData.date, style: TextStyle(color: themeState.currentTheme['Button foreground'])),
              IconButton(
                icon: Icon(Icons.close, color: themeState.currentTheme['Button foreground'],),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        backgroundColor: themeState.currentTheme['Dialog Background'],
                        title: Text(translationState.currentLanguage['Confirm Action']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                        content: Text(translationState.currentLanguage['Are you sure you want to remove this video replay?']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                        actions: <Widget>[
                          TextButton(
                            child: Text(translationState.currentLanguage['Cancel']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                          ),
                          TextButton(
                            child: Text(translationState.currentLanguage['Confirm']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                            onPressed: () {
                              widget.videoReplaySearchState.deletePersonalVideoReplays(widget.videoReplayData.videoId);
                              Navigator.of(context).pop();
                            },
                          ),
                        ],
                      );
                    },
                  );
                },
                tooltip: translationState.currentLanguage['Refuse'],
              ),
              if (isPrivateButtonVisible)
                IconButton(
                  icon: Icon(Icons.lock, color: themeState.currentTheme['Button foreground'],),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          backgroundColor: themeState.currentTheme['Dialog Background'],
                          title: Text(translationState.currentLanguage['Confirm Action']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                          content: Text(translationState.currentLanguage['Are you sure you want to make this video private?']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                          actions: <Widget>[
                            TextButton(
                              child: Text(translationState.currentLanguage['Cancel']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                            ),
                            TextButton(
                              child: Text(translationState.currentLanguage['Confirm']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                              onPressed: () {
                                setState(() {
                                  isPublicButtonVisible = true;
                                  widget.videoReplayData.isPublic = false;
                                  isPrivateButtonVisible = false;
                                });
                                widget.videoReplaySearchState.makeVideoReplayPrivate(widget.videoReplayData.videoId);
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
              if (isPublicButtonVisible)
                IconButton(
                  icon: Icon(Icons.lock_open, color: themeState.currentTheme['Button foreground'],),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          backgroundColor: themeState.currentTheme['Dialog Background'],
                          title: Text(translationState.currentLanguage['Confirm Action']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                          content: Text(translationState.currentLanguage['Are you sure you want to make this video public?']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                          actions: <Widget>[
                            TextButton(
                              child: Text(translationState.currentLanguage['Cancel']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                            ),
                            TextButton(
                              child: Text(translationState.currentLanguage['Confirm']!, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
                              onPressed: () {
                                setState(() {
                                  isPrivateButtonVisible = true;
                                  widget.videoReplayData.isPublic = true;
                                  isPublicButtonVisible = false;
                                });
                                widget.videoReplaySearchState.makeVideoReplayPublic(widget.videoReplayData.videoId);
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
