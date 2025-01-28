import 'package:flutter/material.dart';
import 'package:namer_app/general-classes/time-constants.dart';

class TimerService extends ChangeNotifier {
  static final TimerService _instance = TimerService._internal();
  late int _sec;
  late int _min;

  factory TimerService() {
    return _instance;
  }

  TimerService._internal() {
    _sec = 0;
    _min = 0;
  }

  void updateTime(int time) {
    _min = (time / TIME_FORMAT_THRESHOLD).floor();
    _sec = time - _min * TIME_FORMAT_THRESHOLD;
    notifyListeners();
  }

  String formatNumber(int number) {
    return number < NUMERIC_FORMAT_THRESHOLD ? '0$number' : number.toString();
  }

  String formatTime() {
    return '${formatNumber(_min)}:${formatNumber(_sec)}';
  }
}