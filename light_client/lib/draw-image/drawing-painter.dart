import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:namer_app/draw-image/bmp-converter.dart';
import 'package:namer_app/draw-image/pixel.dart';

class DrawingPainter extends CustomPainter {
  late List<Pixel> pixels;
  late String imageUrl;
  late ui.Image image;
  late List<List<int>> differences;
  ValueNotifier<Offset> notifier;
  bool isInitialImageDrawn = false;
  late bool isLoadedImage;

  set setImageUrl(String url) {
    imageUrl = url;
  }

  late List<Pixel> oldPixels;

  DrawingPainter({required this.notifier}) : super(repaint: notifier) {
    pixels = [];
    imageUrl = '';
    isLoadedImage = true;
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (!isInitialImageDrawn) {
      if (isLoadedImage) {
        for (final pixel in pixels) {
          canvas.drawPoints(
            ui.PointMode.points,
            [pixel.offset],
            Paint()
              ..filterQuality = FilterQuality.high
              ..color = pixel.color
              ..strokeWidth = 1.20
              ..style = PaintingStyle.stroke,
          );
          isInitialImageDrawn = true;
        }
      } else {
        final paint = Paint()..filterQuality = FilterQuality.high;
        canvas.drawImage(image, Offset.zero, paint);
        isLoadedImage = true;
      }
    } else {
      Offset offset = notifier.value;
      int pixelIndex = (offset.dy.floor() * 640) + offset.dx.floor();
      Pixel newPixel =
          Pixel(offset: offset, color: const ui.Color.fromRGBO(0, 255, 0, 1));
      pixels[pixelIndex] = newPixel;
      for (final pixel in pixels) {
        canvas.drawPoints(
          ui.PointMode.points,
          [pixel.offset],
          Paint()
            ..filterQuality = FilterQuality.high
            ..color = pixel.color
            ..strokeWidth = 1.20
            ..style = PaintingStyle.stroke,
        );
      }
    }
    oldPixels = pixels;
  }

  Future<bool> getInitialImage() async {
    await ConvertBmpImage.bmpToImage(imageUrl).then((newImage) {
      image = newImage;
    });
    return true;
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
