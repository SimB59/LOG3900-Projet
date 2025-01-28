import 'package:namer_app/environment-variables.dart';
import 'package:socket_io_client/socket_io_client.dart';

class VideoReplaySocketService {
  late Socket videoReplaySocket;

  // Private constructor
  VideoReplaySocketService._private() {
    videoReplaySocket = io("${getServerUrl()}/video-replay", <String, dynamic>{
      'transports': ['websocket'],
    });
    videoReplaySocket.onConnect((_) {
      print('WebSocket connected');
    });

    videoReplaySocket.onConnectError((error) {
      print('WebSocket connection error: $error');
    });

    videoReplaySocket.onDisconnect((_) {
      print('WebSocket disconnected');
    });
  }

  // Static instance variable
  static final VideoReplaySocketService _instance = VideoReplaySocketService._private();

  // Public static method to access the singleton instance
  factory VideoReplaySocketService() => _instance;

  void addCallbackToMessage(String message, Function(dynamic) callback) {
    videoReplaySocket.on(message, callback);
  }

  void sendSocketRequest(String event, String data) {
    print('sent socket request');
    videoReplaySocket.emit(event, data);
  }

  void send(String event, [String? data]) {
    if (data != null) {
      videoReplaySocket.emit(event, data);
    } else {
      videoReplaySocket.emit(event);
    }
  }
}