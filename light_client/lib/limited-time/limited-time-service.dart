import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:namer_app/draw-image/bmp-converter.dart';
import 'package:namer_app/environment-variables.dart';
import 'package:namer_app/general-classes/limited-time-init-io.dart';

class LimitedTimeService extends ChangeNotifier {
  static final LimitedTimeService _instance = LimitedTimeService._internal();
  late List<Uint8List> originalImages;
  late List<Uint8List> modifiedImages;
  late List<Uint8List> leftFilters;
  late List<Uint8List> rightFilters;
  int currentCardIndex = 0;
  late List<String> cardIds;

  factory LimitedTimeService() {
    return _instance;
  }

  LimitedTimeService._internal() {
    originalImages = [];
    modifiedImages = [];
    leftFilters = [];
    rightFilters = [];
    cardIds = [];
  }

  Future<bool> setImages(LimitedTimeInitIO data) async {
    for (int i = 0; i < data.differenceIndices.length; i++) {
      String id = data.cards[i].id;
      cardIds.add(id);
      String filterId = '${id}_${data.differenceIndices[i]}';

      Uint8List originalImage = await ConvertBmpImage.bmpToImgImage(
          "${getServerUrlApi()}/image/light/${id}_original");
      originalImages.add(originalImage);

      Uint8List modifiedImage = await ConvertBmpImage.bmpToImgImage(
          "${getServerUrlApi()}/image/light/${id}_modified");
      modifiedImages.add(modifiedImage);

      Uint8List leftFilter = await ConvertBmpImage.pngToImgImage(
          "${getServerUrlApi()}/image/filter/${filterId}_original");
      leftFilters.add(leftFilter);

      Uint8List rightFilter = await ConvertBmpImage.pngToImgImage(
          "${getServerUrlApi()}/image/filter/${filterId}_modified");
      rightFilters.add(rightFilter);
    }
    return true;
  }

  Uint8List getCurrentOriginalImage() {
    return originalImages[currentCardIndex];
  }

  Uint8List getCurrentModifiedImage() {
    return modifiedImages[currentCardIndex];
  }

  Uint8List getCurrentLeftFilter() {
    return leftFilters[currentCardIndex];
  }

  Uint8List getCurrentRightFilter() {
    return rightFilters[currentCardIndex];
  }
}
