import 'package:audioplayers/audioplayers.dart';

class SoundService {
  static final SoundService _instance = SoundService._internal();
  final AudioPlayer _audioPlayer = AudioPlayer();

  factory SoundService() {
    return _instance;
  }

  SoundService._internal();

  Future<void> playSuccessSound() async {
    await _audioPlayer.setSource(AssetSource('success_sound.mp3'));
    await _audioPlayer.resume();
  }

  Future<void> playErrorSound() async {
    await _audioPlayer.setSource(AssetSource('error.mp3'));
    await _audioPlayer.resume();
  }
}
