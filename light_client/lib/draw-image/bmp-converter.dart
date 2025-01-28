import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:http/http.dart' as http;

class ConvertBmpImage {
  static int readWidth(List<int> bytes) {
    return (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
  }

  static int readHeight(List<int> bytes) {
    return (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
  }

  static Future<ui.Image> bmpToImage(String imagePath) async {
    final response = await http.get(Uri.parse(imagePath));
    final bytes = response.bodyBytes;
    final ByteData data = ByteData.view(Uint8List.fromList(bytes).buffer);
    final ui.Codec codec =
        await ui.instantiateImageCodec(data.buffer.asUint8List());
    final ui.FrameInfo info = await codec.getNextFrame();
    return info.image;
  }

  static Future<Uint8List> bmpToImgImage(String imagePath) async {
    final http.Response response = await http.get(Uri.parse(imagePath));
    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      throw Exception('Failed to load image: ${response.statusCode}');
    }
  }

  static Future<Uint8List> pngToImgImage(String imagePath) async {
    final http.Response response = await http.get(Uri.parse(imagePath));

    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      throw Exception('Failed to load image: ${response.statusCode}');
    }
  }
}
