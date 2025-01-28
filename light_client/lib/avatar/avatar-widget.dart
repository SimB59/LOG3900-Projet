import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';

class Avatar extends StatefulWidget {
  final Function(XFile?) onImageSelected;
  const Avatar({required this.onImageSelected, Key? key}) : super(key: key);

  @override
  State<Avatar> createState() => _AvatarState();
}

class _AvatarState extends State<Avatar> {
  XFile? _imageFile;
  final ImagePicker _picker = ImagePicker();

  Future<void> _takePicture() async {
    try {
      final XFile? pickedFile =
          await _picker.pickImage(source: ImageSource.camera);
      if (pickedFile != null) {
        setState(() {
          _imageFile = pickedFile;
        });
        widget.onImageSelected(_imageFile);
      }
    } catch (error) {}
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
    widget.onImageSelected(_imageFile);
  }

  void _resetToDefault() {
    setState(() {
      _imageFile = null;
    });
  }

  void _selectAvatar() async {
    final String? selectedImage = await showDialog<String>(
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

    if (selectedImage != null) {
      setState(() {
        _imageFile = XFile(selectedImage);
      });
      widget.onImageSelected(_imageFile);
    }
  }

  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    return Row(
      children: <Widget>[
        SizedBox(
          width: 40,
          height: 40,
          child: Visibility(
            visible: _imageFile != null,
            child: IconButton(
              icon: Icon(
                Icons.delete,
                color: themeState.currentTheme['Button foreground'],
              ),
              onPressed: _resetToDefault,
              iconSize: 30,
              constraints: const BoxConstraints.tightFor(
                width: 40,
                height: 40,
              ),
              color: Colors.transparent,
            ),
          ),
        ),
        const SizedBox(width: 5),
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.black,
              width: 3,
            ),
          ),
          child: ClipOval(
            child: SizedBox(
              height: 75,
              width: 75,
              child: Stack(
                alignment: Alignment.center,
                children: <Widget>[
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.black,
                        width: 3,
                      ),
                    ),
                    child: CircleAvatar(
                      radius: 37.5,
                      backgroundImage: _imageFile != null
                          ? FileImage(File(_imageFile!.path))
                          : const AssetImage(
                                  'assets/images/avatar-placeholder.png')
                              as ImageProvider,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 5),
        SizedBox(
          width: 40,
          height: 40,
          child: IconButton(
            icon: Icon(
              Icons.photo_library,
              color: themeState.currentTheme['Button foreground'],
            ),
            onPressed: _selectAvatar,
            iconSize: 30,
            constraints: const BoxConstraints.tightFor(
              width: 40,
              height: 40,
            ),
            color: Colors.transparent,
          ),
        ),
        const SizedBox(width: 5),
        SizedBox(
          width: 40,
          height: 40,
          child: IconButton(
            icon: Icon(
              Icons.camera_alt,
              color: themeState.currentTheme['Button foreground'],
            ),
            onPressed: _takePicture,
            iconSize: 30,
            constraints: const BoxConstraints.tightFor(
              width: 40,
              height: 40,
            ),
            color: Colors.transparent,
          ),
        ),
      ],
    );
  }
}
