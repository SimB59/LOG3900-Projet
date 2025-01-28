import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:logger/logger.dart';
import 'package:namer_app/account/account-service.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/button-style.dart';
import 'package:namer_app/common-widgets/sliding-button-language.dart';
import 'package:namer_app/common-widgets/sliding-button-theme.dart';
import 'package:namer_app/communication/communication-service.dart';
import 'package:namer_app/general-classes/http-constants.dart';
import 'package:namer_app/profile/connexion-history.dart';
import 'package:namer_app/profile/game-history.dart';
import 'package:namer_app/profile/profile-state.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

const int MAX_LENGTH_PSEUDO = 40;

class _ProfilePageState extends State<ProfilePage> {
  final TextEditingController _pseudoController = TextEditingController();
  bool _showValidationError = false;
  late Future<Widget> _avatarFuture;

  final String leftRoute = '/home';
  final String rightRoute = '/profile';

  XFile? _imageFile;
  bool _isDefaultImage = true;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _avatarFuture = AccountService.setAccountAvatar();
    ProfileState profileStateTemp = ProfileState();
    profileStateTemp.getAccountActivity(AccountService.accountUserId);
    profileStateTemp.getGameHistory(AccountService.accountUserId);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _avatarFuture = AccountService.setAccountAvatar(); // Refresh avatar image
  }

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    var profileState = context.watch<ProfileState>();
    var translationState = context.watch<TranslationState>();
    return Scaffold(
      body: Container(
        decoration: gradientBackground(themeState),
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Column(
            children: <Widget>[
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: <Widget>[
                  ElevatedButton(
                    onPressed: () async {
                      var logger = Logger();
                      http.Response response = await logout();
                      logger.d(response.statusCode);
                      debugPrint(response.statusCode.toString());
                      if (response.statusCode == httpStatusOk) {
                        Navigator.pushNamed(context, '/login');
                      }
                      Navigator.pushNamed(context, '/login');
                    },
                    style: logoutButtonStyle(themeState),
                    child: Text(
                      translationState.currentLanguage['Log out']!,
                    ),
                  ),
                  const SizedBox(width: 20),
                  SlidingButtonTheme(themeState: themeState),
                  const SizedBox(width: 20),
                  SlidingButtonLanguage(translationState: translationState),
                ],
              ),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2.0),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const SizedBox(width: 5),
                    Column(
                      children: <Widget>[
                        Text(
                          getAccountPseudo(),
                          style: TextStyle(
                            color: themeState.currentTheme['Button foreground'],
                          ),
                        ),
                        FutureBuilder<Widget>(
                          future: _avatarFuture,
                          builder: (context, snapshot) {
                            Widget imageWidget = snapshot.hasData
                                ? snapshot.data!
                                : const CircularProgressIndicator();
                            return Stack(
                              alignment: Alignment.bottomRight,
                              children: <Widget>[
                                Padding(
                                  padding: const EdgeInsets.all(2.0),
                                  child: ClipOval(
                                    child: SizedBox(
                                      width: 200,
                                      height: 200,
                                      child: FittedBox(
                                        fit: BoxFit.cover,
                                        child: Image(
                                          image: MemoryImage(
                                            AccountService.localAvatar,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 0,
                                  left: 0,
                                  child: SizedBox(
                                    width: 30,
                                    height: 30,
                                    child: Visibility(
                                      visible: _isDefaultImage,
                                      child: IconButton(
                                        icon: Icon(
                                          Icons.delete,
                                          color: themeState.currentTheme[
                                              'Button foreground'],
                                        ),
                                        onPressed: _loadDefaultImage,
                                        iconSize: 20,
                                        constraints:
                                            const BoxConstraints.tightFor(
                                          width: 30,
                                          height: 30,
                                        ),
                                        color: Colors.transparent,
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  bottom: 0,
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Column(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 30,
                                          height: 30,
                                          child: IconButton(
                                            icon: Icon(
                                              Icons.photo_library,
                                              color: themeState.currentTheme[
                                                  'Button foreground'],
                                            ),
                                            onPressed: _selectAvatar,
                                            iconSize: 20,
                                            constraints:
                                                const BoxConstraints.tightFor(
                                              width: 30,
                                              height: 30,
                                            ),
                                            color: Colors.transparent,
                                          ),
                                        ),
                                        const SizedBox(width: 5),
                                        SizedBox(
                                          width: 30,
                                          height: 30,
                                          child: IconButton(
                                            icon: Icon(
                                              Icons.camera_alt,
                                              color: themeState.currentTheme[
                                                  'Button foreground'],
                                            ),
                                            onPressed: _updateAvatarPicture,
                                            iconSize: 20,
                                            constraints:
                                                const BoxConstraints.tightFor(
                                              width: 30,
                                              height: 30,
                                            ),
                                            color: Colors.transparent,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                        Text(
                          '${translationState.currentLanguage['Level']} ${(AccountService.level / 2).floor() + 1} (${translationState.currentLanguage[AccountService.findAccountRankName(AccountService.rank)]})',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: themeState.currentTheme['Button foreground'],
                          ),
                        ),
                      ],
                    ),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          children: <Widget>[
                            Expanded(
                              child: Column(
                                children: <Widget>[
                                  Center(
                                    child: Text(
                                      translationState
                                          .currentLanguage['Username']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    getAccountPseudo(),
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      _showUpdatePseudoDialog();
                                    },
                                    style: buttonStyle(themeState),
                                    child: Text(
                                      translationState
                                          .currentLanguage['Change username']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                children: <Widget>[
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Number of games played']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${profileState.amountOfGamesPlayed}',
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Number of games won']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${profileState.amountOfGamesWon}',
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                children: <Widget>[
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Average time per game']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    profileState.averageTimePerGame
                                        .toStringAsFixed(2),
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                  Center(
                                    child: Text(
                                      translationState.currentLanguage[
                                          'Average differences found per game']!,
                                      style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground'],
                                      ),
                                    ),
                                  ),
                                  Text(
                                    profileState.averageDifferencesFoundPerGame
                                        .toStringAsFixed(2),
                                    style: TextStyle(
                                      color: themeState
                                          .currentTheme['Button foreground'],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16.0),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Container(
                  height: MediaQuery.of(context).size.height * 0.40,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              border:
                                  Border.all(color: Colors.white, width: 2.0),
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(1.0),
                              child: Text(
                                translationState.currentLanguage['Activity']!,
                                style: TextStyle(
                                    color: themeState
                                        .currentTheme['Button foreground']),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.4,
                              height: MediaQuery.of(context).size.height * 0.35,
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.white, width: 2.0),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: ListView.separated(
                                separatorBuilder: (context, index) =>
                                    const SizedBox(
                                  height: 8,
                                ),
                                itemCount: profileState.activity.length,
                                itemBuilder: (context, index) {
                                  final reversedIndex =
                                      profileState.activity.length - 1 - index;
                                  return ActivityListItem(
                                      activityInstance:
                                          profileState.activity[reversedIndex]);
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.1,
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Container(
                            decoration: BoxDecoration(
                              border:
                                  Border.all(color: Colors.white, width: 2.0),
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(1.0),
                              child: Text(
                                translationState
                                    .currentLanguage['Game history']!,
                                style: TextStyle(
                                    color: themeState
                                        .currentTheme['Button foreground']),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: Container(
                              width: MediaQuery.of(context).size.width * 0.4,
                              height: MediaQuery.of(context).size.height * 0.35,
                              decoration: BoxDecoration(
                                border:
                                    Border.all(color: Colors.white, width: 2.0),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              child: ListView.separated(
                                separatorBuilder: (context, index) =>
                                    const SizedBox(
                                  height: 8,
                                ),
                                itemCount: profileState.gameHistory.length,
                                itemBuilder: (context, index) {
                                  final reversedIndex =
                                      profileState.gameHistory.length -
                                          1 -
                                          index;
                                  return GameHistoryListItem(
                                      gameHistoryInstance: profileState
                                          .gameHistory[reversedIndex]);
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pseudoController.dispose();
    super.dispose();
  }

  bool isPseudoValid(String newPseudo) {
    final alphanumericRegex = RegExp(r'^[a-zA-Z0-9]+$');
    return newPseudo.length >= 1 &&
        newPseudo.length <= MAX_LENGTH_PSEUDO &&
        alphanumericRegex.hasMatch(newPseudo);
  }

  Future<void> updatePseudo(String newPseudo) async {
    setState(() {
      _showValidationError = false;
    });
    Map<String, dynamic> pseudoBody = {
      'oldPseudo': AccountService.accountPseudo,
      'newPseudo': newPseudo,
    };
    http.Response response = await postDynamic('account/pseudo', pseudoBody);
    if (response.statusCode == httpStatusOk) {
      AccountService.accountPseudo = newPseudo;
    } else {
      _showPseudoTakenDialog();
    }
    setState(() => {});
  }

  void _showPseudoTakenDialog() {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        var themeState = context.watch<ThemeState>();
        var translationState = dialogContext.watch<TranslationState>();
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(
            translationState.currentLanguage['Username not available']!,
          ),
          content: Text(
            translationState.currentLanguage[
                'The username you have chosen is already taken. Please try another one.']!,
            style:
                TextStyle(color: themeState.currentTheme['Button foreground']),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(); // Close the dialog
              },
              child: Text(
                'OK',
                style: TextStyle(
                    color: themeState.currentTheme['Button foreground']),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _setImage(String imageAssetPath) async {
    final byteData = await rootBundle.load(imageAssetPath);
    final buffer = byteData.buffer;
    Directory tempDir = await getTemporaryDirectory();
    String tempPath = tempDir.path;
    String imageName = imageAssetPath.split('/').last;
    String filePath = tempPath + '/' + imageName;
    await File(filePath).writeAsBytes(
        buffer.asUint8List(byteData.offsetInBytes, byteData.lengthInBytes));
    setState(() {
      _imageFile = XFile(filePath);
    });

    File fileAvatarPicture = File(_imageFile!.path);

    List<int> bytes = await fileAvatarPicture.readAsBytes();
    AccountService.localAvatar = Uint8List.fromList(bytes);

    Map<String, dynamic> bodyFields = {
      'userId': AccountService.accountUserId.toString(),
    };
    http.Response response = await postBodyMultiPart(
        'account/update-avatar', bodyFields, fileAvatarPicture);

    if (response.statusCode == HTTP_STATUS_OK) {
      setState(() {
        _avatarFuture = AccountService.setAccountAvatar(forceUpdate: true);
      });
    } else {
      print('Failed to update avatar: ${response.body}');
    }
  }

  Future<void> _selectAvatar() async {
    await showDialog<String>(
      context: context,
      builder: (context) => Dialog(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <String>[
            'assets/user-female-skin-type-1-and-2.jpg',
            'assets/user-female-skin-type-3.jpg',
            'assets/user-female-skin-type-4.jpg',
            'assets/user-female-skin-type-6.jpg',
            'assets/user-male-skin-type-1-and-2.jpg',
            'assets/user-male-skin-type-3.jpg',
            'assets/user-male-skin-type-4.jpg',
            'assets/user-male-skin-type-6.jpg',
          ].map((String image) {
            return GestureDetector(
              onTap: () {
                _setImage(image);
                // Close the dialog and return the selected image path
                Navigator.pop(context);
              },
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Image.asset(
                  image,
                  height: 75,
                  width: 75,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Future<void> _updateAvatarPicture() async {
    try {
      final XFile? pickedFile =
          await _picker.pickImage(source: ImageSource.camera);
      if (pickedFile != null) {
        setState(() {
          _imageFile = pickedFile;
        });

        File fileAvatarPicture = File(pickedFile.path);

        List<int> bytes = await fileAvatarPicture.readAsBytes();
        AccountService.localAvatar = Uint8List.fromList(bytes);

        Map<String, dynamic> bodyFields = {
          'userId': AccountService.accountUserId.toString(),
        };
        http.Response response = await postBodyMultiPart(
            'account/update-avatar', bodyFields, fileAvatarPicture);

        if (response.statusCode == HTTP_STATUS_OK) {
          setState(() {
            _avatarFuture = AccountService.setAccountAvatar(forceUpdate: true);
          });
        } else {
          print('Failed to update avatar: ${response.body}');
        }
      }
    } catch (error) {
      print('Error updating avatar: $error');
    }
  }

  Future<void> _loadDefaultImage() async {
    String imageAssetPath = "assets/avatar-placeholder.jpg";
    final byteData = await rootBundle.load(imageAssetPath);
    final buffer = byteData.buffer;
    Directory tempDir = await getTemporaryDirectory();
    String tempPath = tempDir.path;
    String imageName = imageAssetPath.split('/').last;
    String filePath = tempPath + '/' + imageName;
    Uint8List bufferAsUint8List =
        buffer.asUint8List(byteData.offsetInBytes, byteData.lengthInBytes);
    AccountService.localAvatar = bufferAsUint8List;
    await File(filePath).writeAsBytes(bufferAsUint8List);

    setState(() {
      _imageFile = XFile(filePath);
    });

    File fileAvatarPicture = File(_imageFile!.path);
    Map<String, dynamic> bodyFields = {
      'userId': AccountService.accountUserId.toString(),
    };
    http.Response response = await postBodyMultiPart(
        'account/update-avatar', bodyFields, fileAvatarPicture);

    if (response.statusCode == HTTP_STATUS_OK) {
      setState(() {
        _avatarFuture = AccountService.setAccountAvatar(forceUpdate: true);
      });
    } else {
      print('Failed to update avatar: ${response.body}');
    }
  }

  void _showUpdatePseudoDialog() {
    setState(() {
      _showValidationError = false;
    });

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        var translationState = context.watch<TranslationState>();
        var themeState = context.watch<ThemeState>();
        return AlertDialog(
          backgroundColor: themeState.currentTheme['Dialog Background'],
          title: Text(translationState.currentLanguage['Enter new username']!,
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
                    controller: _pseudoController,
                    maxLines: null, // Allow field to expand
                    decoration: InputDecoration(
                      hintText: "BobSinclair",
                      errorText: _showValidationError
                          ? translationState.currentLanguage[
                              'Invalid username: must be 1-40 characters']!
                          : null,
                      errorMaxLines: 3, // Increase max lines for the error text
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
              child: Text(translationState.currentLanguage['Cancel']!,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: themeState.currentTheme['Button foreground'],
                  )),
            ),
            TextButton(
              onPressed: () {
                String newText = _pseudoController.text;
                if (isPseudoValid(newText)) {
                  updatePseudo(newText);
                  Navigator.of(dialogContext).pop();
                } else {
                  (dialogContext as Element).markNeedsBuild();
                  setState(() {
                    _showValidationError = true;
                  });
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
}
