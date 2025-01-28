import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:namer_app/general-classes/video-replay-data.dart';
import 'package:namer_app/socket-service.dart/video-replay-socket-service.dart';

class VideoReplaySearchState extends ChangeNotifier {
  static final VideoReplaySearchState _instance =
      VideoReplaySearchState._internal();
  var videoReplays = <VideoReplayData>[];
  var personalVideoReplays = <VideoReplayData>[];
  late VideoReplaySocketService socket;

  factory VideoReplaySearchState() {
    return _instance;
  }

  VideoReplaySearchState._internal() {
    socket = VideoReplaySocketService();
    handleSocket();
  }

  void getSearchedVideoReplaysCardName(String message) {
    socket.sendSocketRequest('searchVideoReplayCardName', message);
  }

  void getSearchedVideoReplaysPlayerName(String message) {
    socket.sendSocketRequest('searchVideoReplayPlayerName', message);
  }

  void getPersonalVideoReplays(String message) {
    socket.sendSocketRequest('getPersonalVideoReplay', message);
  }

  void deletePersonalVideoReplays(String message) {
    videoReplays.removeWhere((data) => data.videoId == message);
    personalVideoReplays.removeWhere((data) => data.videoId == message);
    notifyListeners();
    socket.sendSocketRequest('deleteVideoReplay', message);
  }

  void makeVideoReplayPublic(String message) {
    socket.sendSocketRequest('changeVisibility', message);
  }

  void makeVideoReplayPrivate(String message) {
    socket.sendSocketRequest('changeVisibility', message);
  }

  handleSocket() {
    socket.addCallbackToMessage(
        'videoReplayCardNameFound',
        (data) => {
              videoReplays = videoReplayListFromJson(jsonDecode(data)),
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'videoReplayPlayerNameFound',
        (data) => {
              videoReplays = videoReplayListFromJson(jsonDecode(data)),
              notifyListeners()
            });
    VideoReplayData videoReplayDataTemp;
    socket.addCallbackToMessage(
        'updateVideoReplayStatus',
        (data) => {
              videoReplayDataTemp = VideoReplayData.fromJson(jsonDecode(data)),
              for (VideoReplayData videoReplayData in personalVideoReplays)
                {
                  if (videoReplayData.accountId ==
                      videoReplayDataTemp.accountId)
                    {
                      videoReplayData = videoReplayDataTemp,
                    }
                },
              notifyListeners()
            });
    socket.addCallbackToMessage(
        'personalVideoReplayFound',
        (data) => {
              personalVideoReplays = videoReplayListFromJson(jsonDecode(data)),
              notifyListeners()
            });
    // socket.addCallbackToMessage(
    //     'getVideoReplay',
    //     (data) => {
    //           personalVideoReplays =  videoReplayListFromJson(jsonDecode(data)),
    //           notifyListeners()
    //         });
  }
}
