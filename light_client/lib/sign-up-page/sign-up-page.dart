import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:logger/logger.dart';
import 'package:namer_app/account/account-friend-service.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/authentication-page/authentication-page-constants.dart';
import 'package:namer_app/avatar/avatar-widget.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/common-widgets/sliding-button-language.dart';
import 'package:namer_app/common-widgets/sliding-button-theme.dart';
import 'package:namer_app/general-classes/http-constants.dart';
import 'package:namer_app/sign-up-page/sign-up-data.dart';
import 'package:namer_app/sign-up-page/sign-up-page-service.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final signUpKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final usernameController = TextEditingController();

  XFile? _imageFile;

  void _handleImageSelected(XFile? imageFile) {
    setState(() {
      _imageFile = imageFile;
    });
  }

  void createAccount() async {
    if (signUpKey.currentState!.validate()) {
      try {
        String avatarPath = "not changed";
        if (_imageFile != null) {
          avatarPath = _imageFile!.path;
        } else {
          File defaultImage = await _loadDefaultImage();
          avatarPath = defaultImage.path;
        }
        //TODO: ADJUST LANGUAGE AND THEME
        SignUpData signUpData = SignUpData(
            email: emailController.text,
            pseudo: usernameController.text,
            password: passwordController.text,
            avatarFilePath: avatarPath,
            language: 'en',
            theme: 'light_mode');

        File fileAvatarPicture = File(avatarPath);
        http.Response response =
            await createAccountOnServer(signUpData, fileAvatarPicture);
        String responseBody = jsonDecode(response.body)['body'];
        if (response.statusCode == httpStatusOk) {
          AccountService.accountUserId = responseBody;
          AccountFriendService accountFriendService = AccountFriendService();
          accountFriendService.updateAccountFriendService();
          accountFriendService.updateFriendsOfFriends();
          Navigator.pushNamed(context, '/home');
        } else if (responseBody == invalidPseudoMessage) {
          showBadPseudoDialog();
        } else if (responseBody == invalidEmailMessage) {
          showBadEmailDialog();
        } else {
          showInternalServerErrorDialog();
        }
      } catch (e) {
        var logger = Logger();
        logger.e(e);
      }
    }
  }

  void backToAuthentication() {
    Navigator.pushNamed(context, '/login');
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    usernameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    var themeState = context.watch<ThemeState>();
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
                                      'assets/images/${themeState.currentTheme['logo']}.png'),
                                  fit: BoxFit.contain),
                            ),
                            SafeArea(
                              child: Center(
                                child: Form(
                                  key: signUpKey,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Text(
                                        translationState.currentLanguage[
                                            'Account creation page']!,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 25,
                                          color: themeState
                                              .currentTheme['Main text color'],
                                        ),
                                      ),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: <Widget>[
                                          Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: <Widget>[
                                              const SizedBox(height: 10),
                                              Container(
                                                constraints:
                                                    const BoxConstraints(
                                                        minWidth: 100,
                                                        maxWidth: 400),
                                                child: TextFormField(
                                                  controller: emailController,
                                                  validator: (value) {
                                                    if (value == null ||
                                                        value.isEmpty) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'An email is required'];
                                                    } else if (value.length >
                                                        maxFieldLength) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'The email must contain a maximum of 50 characters.'];
                                                    }
                                                    return null;
                                                  },
                                                  style: TextStyle(color: themeState.currentTheme['Text color black'], ),
                                                  cursorColor: themeState.currentTheme['Text color black'],
                                                  decoration: InputDecoration(
                                                    labelText: translationState
                                                            .currentLanguage[
                                                        'Email']!,
                                                    labelStyle: TextStyle(
                                                      color: themeState
                                                              .currentTheme[
                                                          'Input Label text color'],
                                                    ),
                                                    hintText: translationState
                                                            .currentLanguage[
                                                        'email@domain.com']!,
                                                    hintStyle: TextStyle(
                                                      color: themeState
                                                              .currentTheme[
                                                          'Input Label text color'],
                                                    ),
                                                    border:
                                                        OutlineInputBorder(),
                                                    focusedBorder:
                                                        OutlineInputBorder(
                                                      borderSide: BorderSide(
                                                        color: themeState
                                                                .currentTheme[
                                                            'Focused border color']!, // Change this color to the desired highlight color
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(height: 10),
                                              Container(
                                                constraints:
                                                    const BoxConstraints(
                                                        minWidth: 100,
                                                        maxWidth: 400),
                                                child: TextFormField(
                                                  controller:
                                                      passwordController,
                                                  validator: (value) {
                                                    if (value == null ||
                                                        value.isEmpty) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'A password is required'];
                                                    } else if (value.length <
                                                        minPasswordLength) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'The password must contain at least 8 characters.'];
                                                    }
                                                    return null;
                                                  },
                                                  obscureText: true,
                                                  style: TextStyle(color: themeState.currentTheme['Text color black'], ),
                                                  cursorColor: themeState.currentTheme['Text color black'],
                                                  decoration: InputDecoration(
                                                    labelText: translationState
                                                            .currentLanguage[
                                                        'Password'],
                                                    labelStyle: TextStyle(
                                                      color: themeState
                                                              .currentTheme[
                                                          'Input Label text color'],
                                                    ),
                                                    border:
                                                        const OutlineInputBorder(),
                                                    focusedBorder:
                                                        OutlineInputBorder(
                                                      borderSide: BorderSide(
                                                        color: themeState
                                                                .currentTheme[
                                                            'Focused border color']!, // Change this color to the desired highlight color
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(height: 10),
                                              Container(
                                                constraints:
                                                    const BoxConstraints(
                                                        minWidth: 100,
                                                        maxWidth: 400),
                                                child: TextFormField(
                                                  controller:
                                                      confirmPasswordController,
                                                  validator: (value) {
                                                    if (value == null ||
                                                        value.isEmpty) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'A password is required'];
                                                    } else if (value.length <
                                                        minPasswordLength) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'The password must contain at least 8 characters.'];
                                                    } else if (value !=
                                                        passwordController
                                                            .text) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'The passwords must be identical'];
                                                    }
                                                    return null;
                                                  },
                                                  obscureText: true,
                                                  style: TextStyle(color: themeState.currentTheme['Text color black'], ),
                                                  cursorColor: themeState.currentTheme['Text color black'],
                                                  decoration: InputDecoration(
                                                    labelText: translationState
                                                            .currentLanguage[
                                                        'Confirm password'],
                                                    labelStyle: TextStyle(
                                                      color: themeState
                                                              .currentTheme[
                                                          'Input Label text color'],
                                                    ),
                                                    border:
                                                        const OutlineInputBorder(),
                                                    focusedBorder:
                                                        OutlineInputBorder(
                                                      borderSide: BorderSide(
                                                        color: themeState
                                                                .currentTheme[
                                                            'Focused border color']!, // Change this color to the desired highlight color
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(height: 10),
                                            ],
                                          ),
                                          const SizedBox(width: 10),
                                          Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: <Widget>[
                                              Avatar(
                                                onImageSelected:
                                                    _handleImageSelected,
                                              ),
                                              const SizedBox(height: 10),
                                              Container(
                                                constraints:
                                                    const BoxConstraints(
                                                        minWidth: 100,
                                                        maxWidth: 400),
                                                child: TextFormField(
                                                  controller:
                                                      usernameController,
                                                  validator: (value) {
                                                    if (value == null ||
                                                        value.isEmpty) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'A username is required'];
                                                    } else if (value.length >
                                                        maxFieldLength) {
                                                      return translationState
                                                              .currentLanguage[
                                                          'The username can contain a maximum of 50 characters.'];
                                                    }
                                                    return null;
                                                  },
                                                  style: TextStyle(color: themeState.currentTheme['Text color black'], ),
                                                  cursorColor: themeState.currentTheme['Text color black'],
                                                  decoration: InputDecoration(
                                                    labelText: translationState
                                                            .currentLanguage[
                                                        'Username'],
                                                    labelStyle: TextStyle(
                                                      color: themeState
                                                              .currentTheme[
                                                          'Input Label text color'],
                                                    ),
                                                    border:
                                                        const OutlineInputBorder(),
                                                    focusedBorder:
                                                        OutlineInputBorder(
                                                      borderSide: BorderSide(
                                                        color: themeState
                                                                .currentTheme[
                                                            'Focused border color']!, // Change this color to the desired highlight color
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: <Widget>[
                                Container(
                                  constraints: const BoxConstraints(
                                      minWidth: 100, maxWidth: 300),
                                  child: ElevatedButton(
                                    style: buttonStyle(themeState),
                                    onPressed: backToAuthentication,
                                    child: Text(translationState
                                        .currentLanguage['Back']!),
                                  ),
                                ),
                                Container(
                                  constraints: const BoxConstraints(
                                      minWidth: 100, maxWidth: 300),
                                  child: ElevatedButton(
                                    style: buttonStyle(themeState),
                                    onPressed: createAccount,
                                    child: Text(translationState
                                        .currentLanguage['Create an account']!),
                                  ),
                                ),
                              ],
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
            )
          )
        );
  }
}

Future<File> _loadDefaultImage() async {
  String imageAssetPath = "assets/avatar-placeholder.jpg";
  final byteData = await rootBundle.load(imageAssetPath);
  final buffer = byteData.buffer;
  Directory tempDir = await getTemporaryDirectory();
  String tempPath = tempDir.path;
  String imageName = imageAssetPath.split('/').last;
  String filePath = tempPath + '/' + imageName;
  return await File(filePath).writeAsBytes(
      buffer.asUint8List(byteData.offsetInBytes, byteData.lengthInBytes));
}
