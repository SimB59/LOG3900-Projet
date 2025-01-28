import 'package:test/test.dart';

import 'chat-state.dart';

void main() {
  //TODO: Proper test this is only an exemple
  test('Counter value should be incremented', () {
    final chatState = ChatState();

    chatState.sendUserMessage('test');

    expect(chatState.messages[1], test);
  });
}