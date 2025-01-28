import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/general-classes/player.dart';
import 'package:provider/provider.dart';

class PlayerScore extends StatefulWidget {
  final Player player;
  final bool hasRank;
  final bool hasScore;

  const PlayerScore(
      {super.key,
      required this.player,
      required this.hasRank,
      required this.hasScore});

  @override
  State<PlayerScore> createState() => _PlayerScoreState();
}

class _PlayerScoreState extends State<PlayerScore> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    var translationState = context.watch<TranslationState>();
    return SizedBox(
      width: 150,
      child: Container(
        color: const Color.fromRGBO(0, 0, 0, 0),
        child: Column(
          children: <Widget>[
            Container(
              decoration: BoxDecoration(
                color: const Color.fromRGBO(0, 255, 255, 0.5),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(3.0),
                child: Text(
                  widget.hasRank
                      ? '${widget.player.pseudo} (${translationState.currentLanguage[widget.player.displayRank]})'
                      : widget.player.pseudo,
                  style: TextStyle(
                      color: themeState.currentTheme['Button foreground']),
                ),
              ),
            ),
            const SizedBox(height: 5),
            Visibility(
              visible: widget.hasScore,
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color.fromRGBO(0, 255, 255, 0.5),
                  border: Border.all(
                    color: Colors.white,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Text(
                    widget.player.differenceCount.toString(),
                    style: TextStyle(
                      color: themeState.currentTheme['Button foreground'],
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
