import 'package:flutter/material.dart';
import 'package:namer_app/common-widgets/text-style.dart';
import 'package:namer_app/general-classes/card-stats.dart';
import 'package:namer_app/leaderboard/leaderboard-row.dart';

class Leaderboard extends StatelessWidget {
  const Leaderboard({super.key, required this.cardStats});

  final CardStats cardStats;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: const Color.fromRGBO(255, 255, 255, 0),
          border: Border.all(style: BorderStyle.solid, color: Colors.white)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Container(
            alignment: Alignment.center,
            color: const Color.fromRGBO(36, 94, 160, 1),
            child: const Padding(
              padding: EdgeInsets.all(15),
              child: Text(
                'CLASSEMENT',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 20,
                ),
              ),
            ),
          ),
          Container(
            color: const Color.fromRGBO(23, 64, 112, 1),
            child: const Padding(
              padding: EdgeInsets.all(15),
              child: Row(
                children: <Widget>[
                  Text(
                    '#0',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color.fromRGBO(23, 64, 112, 1),
                      fontSize: 20,
                    ),
                  ),
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: <Widget>[
                        Text(
                          'Solo',
                          style: leaderboardEntry,
                        ),
                        Text(
                          'Multijoueur',
                          style: leaderboardEntry,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            color: const Color.fromRGBO(27, 121, 230, 1),
            child:
                LeaderboardRow(firstModeStats: cardStats.classical, index: 0),
          ),
          Container(
            color: const Color.fromRGBO(108, 168, 236, 1),
            child:
                LeaderboardRow(firstModeStats: cardStats.classical, index: 1),
          ),
          Container(
            color: const Color.fromRGBO(139, 185, 239, 1),
            child:
                LeaderboardRow(firstModeStats: cardStats.classical, index: 2),
          ),
        ],
      ),
    );
  }
}
