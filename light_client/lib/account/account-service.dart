import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:namer_app/chat/chat-state.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/game-chat/game-chat-state.dart';
import 'package:namer_app/general-classes/http-constants.dart';
import 'package:namer_app/general-classes/message.dart';
import 'package:namer_app/sign-up-page/sign-up-data.dart';
import 'package:namer_app/socket-service.dart/account-socket-service.dart';

const int HTTP_STATUS_OK = 200;

class AccountService {
  static String accountPseudo = "";
  static String accountEmail = "";
  static int rank = 0;
  static int level = 0;
  static Uint8List localAvatar = Uint8List(0);

  // TODO: USE THIS ACCOUNTUSERID INSTEAD
  static String accountUserId = "";

  static String findAccountRankName(int rank) {
    int rankValue = (rank / 2).floor();
    switch (rankValue) {
      case 0:
        return 'Bronze';
      case 1:
        return 'Silver';
      case 2:
        return 'Gold';
      default:
        return 'Platinum';
    }
  }

  static String generateSixDigitCode() {
    Random random = Random();
    int sixDigitNumber = 100000 + random.nextInt(900000);
    return sixDigitNumber.toString();
  }

  static Future<Widget> setAccountAvatar({bool forceUpdate = false}) async {
    String pseudo = AccountService.accountPseudo;

    String cacheBuster =
        forceUpdate ? "?nocache=${DateTime.now().millisecondsSinceEpoch}" : "";

    if (pseudo.isNotEmpty) {
      var response = await getRequest('account/accountid/$pseudo');
      if (response != null) {
        var responseData = json.decode(response.body);
        accountUserId = json.decode(responseData['body']);
      }
    }

    String imageUrl =
        '${getServerUrlApi()}/image/avatar/$accountUserId$cacheBuster';

    return Image.network(
      imageUrl,
      errorBuilder:
          (BuildContext context, Object exception, StackTrace? stackTrace) {
        return Image.network(
            '${getServerUrlApi()}/image/avatar/default-avatar');
      },
    );
  }

  static Future<Widget> setOtherAccountAvatar(String accountId,
      {bool forceUpdate = false}) async {
    String cacheBuster =
        forceUpdate ? "?nocache=${DateTime.now().millisecondsSinceEpoch}" : "";

    String imageUrl =
        '${getServerUrlApi()}/image/avatar/$accountId$cacheBuster';

    return Image.network(
      imageUrl,
      errorBuilder:
          (BuildContext context, Object exception, StackTrace? stackTrace) {
        return Image.network(
            '${getServerUrlApi()}/image/avatar/default-avatar');
      },
    );
  }
}

String getAccountPseudo() {
  return AccountService.accountPseudo;
}

String getAccountEmail() {
  return AccountService.accountEmail;
}

String getNumberOfGamesPlayed() {
  return "TODO";
}

String getBestScore() {
  return "TODO";
}

Future<http.Response> createAccountOnServer(
    SignUpData signUpData, File avatarPicture) async {
  AccountSocketService accountSocketService = AccountSocketService();
  Map<String, dynamic> bodyFields = {
    'pseudo': signUpData.pseudo,
    'email': signUpData.email,
    'password': signUpData.password,
    'avatarFilePath': avatarPicture
        .path, // This may not be required as you're uploading the file separately
    'language': signUpData.language,
    'theme': signUpData.theme,
    'socketId': accountSocketService.accountSocket.id!,
  };

  List<int> bytes = await avatarPicture.readAsBytes();
  AccountService.localAvatar = Uint8List.fromList(bytes);

  http.Response response =
      await postBodyMultiPart('account', bodyFields, avatarPicture);
  if (response.statusCode == HTTP_STATUS_OK) {
    AccountService.accountPseudo = signUpData.pseudo;
    AccountService.accountEmail = signUpData.email;
  }
  return response;
}

Future<http.Response> logout() async {
  var userIdBody = {
    'userId': AccountService.accountUserId,
  };
  Message postMessage =
      Message(title: 'logoutUser', body: jsonEncode(userIdBody));
  http.Response response =
      await postRequest('account/auth/logout', postMessage);

  ChatState chatState = ChatState();
  chatState.messages = [];
  chatState.setHasNotification(false);
  GameChatState gameChatState = GameChatState();
  gameChatState.messages = [];
  gameChatState.setHasNotification(false);
  AccountService.accountPseudo = "";
  AccountService.accountEmail = "";
  AccountService.accountUserId = "";
  AccountService.localAvatar = Uint8List(0);
  return response;
}

sendPasswordChangeRequestEmail(String email, String generatedCode) async {
  Map<String, dynamic> emailAndGeneratedCode = {
    'email': email,
    'generatedCode': generatedCode,
  };
  http.Response response =
      await postDynamic('account/send-password-email', emailAndGeneratedCode);
  if (response.statusCode == httpStatusOk) {}
}

modifyPassword(String email, String newPassword) async {
  Map<String, dynamic> emailAndPassword = {
    'email': email,
    'newPassword': newPassword,
  };
  http.Response response =
      await postDynamic('account/reset-password', emailAndPassword);
  if (response.statusCode == httpStatusOk) {}
}
