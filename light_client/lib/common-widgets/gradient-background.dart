import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';

BoxDecoration gradientBackground(ThemeState themeState) {
  return BoxDecoration(
    
    gradient: LinearGradient(
      begin: Alignment.bottomRight,
      end: Alignment.topLeft,
      stops: const [0, 1],
      colors: [
        themeState.currentTheme['Secondary background']!,
        themeState.currentTheme['Main background']!
      ],
    ),
  );
}