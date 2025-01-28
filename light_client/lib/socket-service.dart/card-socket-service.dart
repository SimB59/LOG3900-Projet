import 'package:namer_app/environment-variables.dart';
import 'package:socket_io_client/socket_io_client.dart';

class CardSocketService {
  late Socket cardSocket;

  CardSocketService() {
    cardSocket = io("${getServerUrl()}/cards", <String, dynamic>{
      'transports': ['websocket'],
    });
  }

  void addCallbackToMessage(String message, Function(dynamic) callback) {
    cardSocket.on(message, callback);
  }
}
