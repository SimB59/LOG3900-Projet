import 'package:flutter/material.dart';

class ThemeState extends ChangeNotifier {
  
  Map<String, dynamic> lightTheme = {
    'Main background': const Color(0xfa0c5ee3),
    'Secondary background': const Color(0xffadb6f8),
    'Sliding button background': Colors.blue,
    'Sliding button circle': const Color.fromARGB(84, 255, 255, 255),
    'Input Label text color':const Color.fromARGB(255, 74, 74, 75),
    'Main text color':const Color.fromARGB(255, 0, 0, 0),
    'Seed color':const Color.fromRGBO(52, 61, 239, 0.627),
    'Text color black':Colors.black,
    'Timer text color': Colors.white,
    'Timer container color': Colors.black,
    'Focused border color':const Color.fromRGBO(52, 61, 239, 0.627),
    'Button background': const Color.fromRGBO(255, 255, 255, 0.682),
    'Button foreground':Colors.black,
    'logo': 'lightlogo',
    'Background App Bar' : Colors.white,
    'Blue icon': Colors.blue,
    'Blue Background': Colors.blue, 
    'Dialog Background' : Colors.white,
    'Crazy home': Color.fromARGB(255, 0, 255, 255),


  };
  Map<String, dynamic> darkTheme = {
    'Main background': const Color.fromARGB(249, 0, 0, 0),
    'Secondary background': Color.fromARGB(255, 81, 81, 82),
    'Sliding button background': const Color.fromARGB(255, 0, 0, 0),
    'Sliding button circle': Color.fromARGB(102, 255, 166, 0),
    'Input Label text color':const Color.fromARGB(255, 158, 158, 158),

    'Text color black': Color.fromARGB(255, 255, 165, 0),

    'Main text color':const Color.fromARGB(255, 218, 218, 218),
    'Timer text color': Color.fromARGB(255, 255, 165, 0),
    'Timer container color':Color.fromARGB(255, 255, 165, 0),
    'Focused border color':Color.fromARGB(255, 255, 165, 0),
    'Button background': const Color.fromARGB(105, 105, 104, 122),
    'Button foreground':Color.fromARGB(255, 255, 165, 0),
    'logo': 'darklogo',
    'Background app bar' : Colors.black,
    'Blue icon': Color.fromARGB(255, 255, 165, 0),
    'Blue Background': Colors.black, 

    'Dialog Background' : Color.fromARGB(255, 95, 94, 121),
    'Crazy home': Color.fromARGB(255, 255, 165, 0),
  };
  late Map<String, dynamic> currentTheme = lightTheme;
  late String currentThemeString = 'light';

  ThemeState._internal();

  static final ThemeState _instance = ThemeState._internal();

  factory ThemeState() {
    return _instance;
  }

  static ThemeState get instance => _instance;

  void setTheme(String receivedSymbol){
    if(receivedSymbol == 'dark'){
      currentTheme = darkTheme;
      currentThemeString = 'dark';
    }else if(receivedSymbol == 'light'){
      currentTheme = lightTheme;
      currentThemeString = 'light';
    }else{
      currentTheme == lightTheme;
    }
    notifyListeners();
  }
}