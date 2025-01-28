import 'package:flutter/material.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/video-replay-data.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:namer_app/video-replay-search-page/video-replay-search-state.dart';
import 'package:namer_app/video-replay/video-replay-state.dart';
import 'package:provider/provider.dart';

class VideoReplayPublicListItem extends StatefulWidget {
  final VideoReplayData videoReplayData;
  final VideoReplaySearchState videoReplaySearchState;

  const VideoReplayPublicListItem(
      {super.key, required this.videoReplayData, required this.videoReplaySearchState});

  @override
  State<VideoReplayPublicListItem> createState() => _VideoReplayPublicListItemState();
}

class _VideoReplayPublicListItemState extends State<VideoReplayPublicListItem> {
  bool isPublicButtonVisible = true;
  bool isPrivateButtonVisible = false;
  
  late AccountFriendService accountFriendService;
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
        gameState.setMainImages(widget.videoReplayData.cardId);
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
              Text(widget.videoReplayData.pseudo, style: TextStyle(color: themeState.currentTheme['Button foreground']),)
            ],
          ),
          trailing: Text(widget.videoReplayData.date, style: TextStyle(color: themeState.currentTheme['Button foreground']),),
        ),
      ),
    );
  }
}
