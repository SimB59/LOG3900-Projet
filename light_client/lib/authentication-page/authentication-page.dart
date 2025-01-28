import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/accounts-page/accounts-state.dart';
import 'package:namer_app/authentication-page/authentication-page-constants.dart';
import 'package:namer_app/authentication-page/authentication-page-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/common-widgets/sliding-button-language.dart';
import 'package:namer_app/common-widgets/sliding-button-theme.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/general-classes/account-data.dart';
import 'package:namer_app/general-classes/authentication-info.dart';
import 'package:namer_app/general-classes/http-constants.dart';
import 'package:namer_app/general-classes/message.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class AuthenticationPage extends StatefulWidget {
  const AuthenticationPage({super.key});

  @override
  State<AuthenticationPage> createState() => _AuthenticationPageState();
}

class _AuthenticationPageState extends State<AuthenticationPage> {
  final loginKey = GlobalKey<FormState>();
  final pseudoController = TextEditingController();
  final passwordController = TextEditingController();
  String generatedCode = AccountService.generateSixDigitCode();
  final TextEditingController _forgotPasswordController =
      TextEditingController();
  final TextEditingController _generatedCodeInputController =
      TextEditingController();
  final TextEditingController _newPasswordInputController =
      TextEditingController();

  void validateLogin() async {
    var logger = Logger();
    if (loginKey.currentState!.validate()) {
      AccountsState accountsState = AccountsState();
      AuthenticationInfo authenticationInfo = AuthenticationInfo(
          pseudo: getTextFromController(pseudoController),
          password: getTextFromController(passwordController),
          socketId: accountsState.socket.accountSocket.id!);
      Message postMessage = Message(
          title: 'loginUser', body: jsonEncode(authenticationInfo.toJson()));
      http.Response response = await postRequest('account/auth', postMessage);

      if (response.statusCode == httpStatusOk) {
        String responseBody = jsonDecode(response.body)['body'];
        AccountService.accountPseudo = getTextFromController(pseudoController);
        AccountService.accountEmail = jsonDecode(responseBody)['email'];
        AccountService.accountUserId = jsonDecode(responseBody)['userId'];

        var responseForAccount =
            await getRequest('account/${AccountService.accountPseudo}');
        if (responseForAccount != null) {
          var responseData = json.decode(responseForAccount.body);
          var responseDataAccount =
              AccountData.fromJson(json.decode(responseData['body']));
          ThemeState themeState = ThemeState();
          
          themeState.setTheme(responseDataAccount.theme);
          print('theme ' + responseDataAccount.theme);
          TranslationState translationState = TranslationState();
          translationState.setLanguage(responseDataAccount.language);
          AccountService.rank = responseDataAccount.accountRank;
          AccountService.level = responseDataAccount.accountLevel;
        }

        var responseForAvatar =
            await getRequest('account/avatar/${AccountService.accountUserId}');
        if (responseForAvatar != null) {
          AccountService.localAvatar = responseForAvatar.bodyBytes;
        }

        AccountFriendService accountFriendService = AccountFriendService();
        accountFriendService.updateAccountFriendService();
        accountFriendService.updateFriendsOfFriends();

        proceedToHomePage();
      } else if (response.statusCode == httpStatusUnauthorized) {
        await showUnauthorizedDialog();
      } else if (response.statusCode == httpStatusNotFound) {
        await showIncorrectLoginDialog();
      } else {
        await showInternalServerErrorDialog();
      }
    }
  }

  void signUp() {
    Navigator.pushNamed(context, '/sign-up');
  }

  void proceedToHomePage() {
    Navigator.pushNamed(context, '/home');
  }

  @override
  void dispose() {
    pseudoController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  bool isEmailValid(String email) {
    String pattern =
        r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@'
        r'((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|'
        r'(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
    RegExp regex = RegExp(pattern);
    return regex.hasMatch(email);
  }

  bool isMatchingCode(String code) {
    return code == generatedCode;
  }

  void _submitNewPasswordDialog() {
    TranslationState translationState = TranslationState();
    ThemeState themeState = ThemeState();
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
              translationState.currentLanguage[
                  'Enter the code you received by email and your new password.']!,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Color.fromARGB(255, 12, 106, 184))),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                ConstrainedBox(
                  // Add ConstrainedBox
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.3,
                  ),
                  child: TextField(
                    controller: _generatedCodeInputController,
                    maxLines: null, // Allow field to expand
                    decoration: const InputDecoration(
                      hintText: "123456",
                      // errorText: _showValidationError
                      //     ? 'Invalid Pseudo: Must be 1-$MAX_LENGTH_PSEUDO chars & alphanumeric'
                      //     : null,
                      // errorMaxLines: 3, // Increase max lines for the error text
                    ),
                  ),
                ),
                ConstrainedBox(
                  // Add ConstrainedBox
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.3,
                  ),
                  child: TextField(
                    controller: _newPasswordInputController,
                    maxLines: null, // Allow field to expand
                    decoration: InputDecoration(
                      hintText:
                          translationState.currentLanguage['newPassword']!,
                      // errorText: _showValidationError
                      //     ? 'Invalid Pseudo: Must be 1-$MAX_LENGTH_PSEUDO chars & alphanumeric'
                      //     : null,
                      // errorMaxLines: 3, // Increase max lines for the error text
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: Text(
                translationState.currentLanguage['Cancel']!,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: themeState.currentTheme['Button foreground'],
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                String emailRecovery = _forgotPasswordController.text;
                String newPassword = _newPasswordInputController.text;
                if (isMatchingCode(_generatedCodeInputController.text)) {
                  modifyPassword(emailRecovery, newPassword);
                  Navigator.of(dialogContext).pop();
                } else {
                  (dialogContext as Element).markNeedsBuild();
                  // setState(() {
                  //   _showValidationError = true;
                  // });
                }
              },
              child: Text(
                translationState.currentLanguage['Confirm']!,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: themeState.currentTheme['Button foreground'],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _showChangePasswordDialog() {
    TranslationState translationState = TranslationState();
    ThemeState themeState = ThemeState();
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState
                .currentLanguage['Enter email to recover password.']!,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: themeState.currentTheme['Button foreground'],
            ),
          ),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.3,
                  ),
                  child: TextField(
                    controller: _forgotPasswordController,
                    maxLines: null, // Allow field to expand
                    decoration: InputDecoration(
                      hintText:
                          translationState.currentLanguage['email@domain.com']!,
                      // errorText: _showValidationError
                      //     ? 'Invalid Pseudo: Must be 1-$MAX_LENGTH_PSEUDO chars & alphanumeric'
                      //     : null,
                      // errorMaxLines: 3, // Increase max lines for the error text
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: Text(
                translationState.currentLanguage['Cancel']!,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: themeState.currentTheme['Button foreground'],
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                String emailRecovery = _forgotPasswordController.text;
                if (isEmailValid(emailRecovery)) {
                  sendPasswordChangeRequestEmail(emailRecovery, generatedCode);
                  Navigator.of(dialogContext).pop();
                  _submitNewPasswordDialog();
                } else {
                  (dialogContext as Element).markNeedsBuild();
                  // setState(() {
                  //   _showValidationError = true;
                  // });
                }
              },
              child: Text(
                translationState.currentLanguage['Confirm']!,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: themeState.currentTheme['Button foreground'],
                ),
              ), 
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    var translationState = context.watch<TranslationState>();
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Container(
        decoration: gradientBackground(themeState),
        child: Stack(
          children: [
            Center(
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: <Widget>[
                    Column(
                      children: <Widget>[
                        Container(
                          constraints: const BoxConstraints(maxWidth: 550),
                          child: Image(
                            image: AssetImage(
                              'assets/images/${themeState.currentTheme['logo']}.png',
                            ),
                          ),
                        ),
                        SafeArea(
                          child: Center(
                            child: Form(
                              key: loginKey,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: <Widget>[
                                  Text(
                                    translationState
                                        .currentLanguage['Connection']!,
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Main text color'],
                                      fontWeight: FontWeight.bold,
                                      fontSize: 25,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Container(
                                    constraints: const BoxConstraints(
                                        minWidth: 100, maxWidth: 500),
                                    child: TextFormField(
                                      controller: pseudoController,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return translationState
                                                  .currentLanguage[
                                              'A username is required']!;
                                        } else if (value.length >
                                            maxFieldLength) {
                                          return translationState
                                                  .currentLanguage[
                                              'A username can contain a maximum of 50 characters.']!;
                                        }
                                        return null;
                                      },
                                      style: TextStyle(color: themeState.currentTheme['Text color black'], ),
                                      cursorColor: themeState.currentTheme['Text color black'],
                                      decoration: InputDecoration(
                                        labelText: translationState
                                            .currentLanguage['Username']!,
                                        labelStyle: TextStyle(
                                          color: themeState.currentTheme[
                                              'Input Label text color']!,
                                        ),
                                        border: const OutlineInputBorder(),
                                        focusedBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: themeState.currentTheme[
                                                'Focused border color']!, // Change this color to the desired highlight color
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Container(
                                    constraints: const BoxConstraints(
                                      minWidth: 100,
                                      maxWidth: 500,
                                    ),
                                    child: TextFormField(
                                      controller: passwordController,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return translationState
                                                  .currentLanguage[
                                              'A password is required']!;
                                        } else if (value.length <
                                            minPasswordLength) {
                                          return translationState
                                                  .currentLanguage[
                                              'The password must contain at least 8 characters.']!;
                                        }
                                        return null;
                                      },
                                      style: TextStyle(color: themeState.currentTheme['Text color black'], ),
                                      cursorColor: themeState.currentTheme['Text color black'],
                                      obscureText: true,
                                      decoration: InputDecoration(
                                        labelText: translationState
                                            .currentLanguage['Password']!,
                                        labelStyle: TextStyle(
                                          color: themeState.currentTheme[
                                              'Input Label text color']!,
                                        ),
                                        border: const OutlineInputBorder(),
                                        focusedBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: themeState.currentTheme[
                                                'Focused border color']!, // Change this color to the desired highlight color
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  InkWell(
                                    splashColor: Colors
                                        .transparent, // Prevent visual ripple effect
                                    onTap: _showChangePasswordDialog,
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8.0),
                                      child: Text(
                                        translationState.currentLanguage[
                                            'Forgot Password?']!,
                                        style: TextStyle(
                                          color: themeState
                                              .currentTheme['Main text color'],
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Container(
                                        constraints: const BoxConstraints(
                                            minWidth: 100, maxWidth: 250),
                                        child: ElevatedButton(
                                          style: buttonStyle(themeState),
                                          onPressed: validateLogin,
                                          child: Text(
                                            translationState
                                                .currentLanguage['Connect']!,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        constraints: const BoxConstraints(
                                            minWidth: 100, maxWidth: 250),
                                        child: ElevatedButton(
                                          style: buttonStyle(themeState),
                                          onPressed: () {
                                            Navigator.pushNamed(
                                              context,
                                              '/sign-up',
                                            );
                                          },
                                          child: Text(
                                            translationState.currentLanguage[
                                                'Create an account']!,
                                          ),
                                        ),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 20,
              right: 20,
              child: SlidingButtonLanguage(translationState: translationState),
            ),
            Positioned(
              top: 20,
              right: 120,
              child: SlidingButtonTheme(themeState: themeState),
            ),
          ],
        ),
      ),
    );
  }
}
