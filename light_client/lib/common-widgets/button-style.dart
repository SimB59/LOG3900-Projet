import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';

ButtonStyle buttonStyle(ThemeState themeState) {
  return ElevatedButton.styleFrom(
      backgroundColor: themeState.currentTheme['Button background'],
      foregroundColor: themeState.currentTheme['Button foreground'],
      side: const BorderSide(width: 2.0, color: Colors.black),
      elevation: 5,
      minimumSize: const Size(300, 50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(25),
      ),
      textStyle: const TextStyle(
        fontWeight: FontWeight.bold,
      ));
}

ButtonStyle logoutButtonStyle(ThemeState themeState) {
  return ElevatedButton.styleFrom(
      backgroundColor: themeState.currentTheme['Button background'],
      foregroundColor: themeState.currentTheme['Button foreground'],
      side: const BorderSide(width: 2.0, color: Colors.black),
      elevation: 5,
      minimumSize: const Size(166, 50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(25),
      ),
      textStyle: const TextStyle(
        fontWeight: FontWeight.bold,
      ));
}

ButtonStyle disableableButtonStyle(ThemeState themeState, bool isEnabled) {
  return ElevatedButton.styleFrom(
      backgroundColor: isEnabled
          ? const Color.fromRGBO(255, 255, 255, 0.682)
          : const Color.fromRGBO(255, 255, 255, 0.200),
      foregroundColor:
          isEnabled ? Colors.black : const Color.fromRGBO(0, 0, 0, 0.500),
      side: const BorderSide(width: 2.0, color: Colors.black),
      elevation: 5,
      minimumSize: const Size(300, 50),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(25),
      ),
      textStyle: const TextStyle(
        fontWeight: FontWeight.bold,
      ));
}

ButtonStyle homeButtonStyle(ThemeState themeState) {
  return ElevatedButton.styleFrom(
      backgroundColor: Colors.black,
      foregroundColor: themeState.currentTheme['Crazy home'],
      side: const BorderSide(width: 1.0, color: Colors.grey),
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5.0)));
}
