import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/timer/timer-service.dart';
import 'package:provider/provider.dart';

class Timer extends StatefulWidget {
  const Timer({super.key});

  @override
  State<Timer> createState() => _TimerState();
}

class _TimerState extends State<Timer> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    TimerService timerService = context.watch<TimerService>();
    var themeState = context.watch<ThemeState>();
    return Container(
      decoration: BoxDecoration(
        color: themeState.currentTheme['Timer container color'],
        borderRadius: BorderRadius.circular(25),
      ),
      width: 130,
      height: 45,
      child: Center(
        child: Text(
          timerService.formatTime(),
          style: TextStyle(
            color: themeState.currentTheme['Timer text color'],
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
