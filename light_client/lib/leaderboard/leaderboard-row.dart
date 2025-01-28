import 'package:flutter/material.dart';
import 'package:namer_app/common-widgets/text-style.dart';
import 'package:namer_app/general-classes/card-stats.dart';
import 'package:namer_app/general-classes/time-constants.dart';

class LeaderboardRow extends StatelessWidget {
  const LeaderboardRow(
      {super.key, required this.firstModeStats, required this.index});

  final FirstModeStats firstModeStats;
  final int index;

  String formatTime(int timeInSeconds) {
    final int minutes = (timeInSeconds ~/ TIME_FORMAT_THRESHOLD).toInt();
    final int seconds = (timeInSeconds % TIME_FORMAT_THRESHOLD).toInt();
    final String formattedMinutes = formatNumber(minutes);
    final String formattedSeconds = formatNumber(seconds);
    return '$formattedMinutes m$formattedSeconds s';
  }

  String formatNumber(int number) {
    return number < NUMERIC_FORMAT_THRESHOLD ? '0$number' : '$number';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(15),
      child: Row(
        children: <Widget>[
          Text(
            '#${index + 1}',
            style: leaderboardEntry,
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                Column(
                  children: <Widget>[
                    Text(
                      firstModeStats.solo[0].name,
                      style: leaderboardEntry,
                    ),
                    Text(
                      formatTime(firstModeStats.solo[0].score),
                      style: leaderboardEntry,
                    ),
                  ],
                ),
                Column(
                  children: <Widget>[
                    Text(
                      firstModeStats.versus[0].name,
                      style: leaderboardEntry,
                    ),
                    Text(
                      formatTime(firstModeStats.versus[0].score),
                      style: leaderboardEntry,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
