import 'package:flutter/material.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:provider/provider.dart';

class SlidingButtonCheat extends StatefulWidget {
  const SlidingButtonCheat(
      {Key? key, required this.isCheatModeOn, required this.onTap})
      : super(key: key);
  final bool isCheatModeOn;
  final VoidCallback onTap;

  @override
  _SlidingButtonCheatState createState() => _SlidingButtonCheatState();
}

class _SlidingButtonCheatState extends State<SlidingButtonCheat> {
  @override
  Widget build(BuildContext context) {
    var themeState = context.watch<ThemeState>();
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        width: 80,
        height: 30,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: themeState.currentTheme['Sliding button background'],
        ),
        child: Stack(
          children: [
            Positioned(
              left: 0,
              top: 0,
              bottom: 0,
              width: 50,
              child: Center(
                child: Icon(
                  Icons.done,
                  color:
                      widget.isCheatModeOn ? Colors.white : Colors.transparent,
                ),
              ),
            ),
            Positioned(
              right: 0,
              top: 0,
              bottom: 0,
              width: 50,
              child: Center(
                child: Icon(
                  Icons.close,
                  color:
                      widget.isCheatModeOn ? Colors.transparent : Colors.white,
                ),
              ),
            ),
            AnimatedPositioned(
              duration: Duration(milliseconds: 300),
              left: widget.isCheatModeOn ? 40 : 0,
              child: Container(
                width: 40,
                height: 30,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
