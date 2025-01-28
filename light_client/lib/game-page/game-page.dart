import 'dart:async' as asyncTimer;
import 'dart:convert';
import 'dart:math' as math;
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:namer_app/abandon-game-dialog/abandon-game-dialog.dart';
import 'package:namer_app/chat/chat.dart';
import 'package:namer_app/common-states/theme-state.dart';
import 'package:namer_app/common-states/translate-state.dart';
import 'package:namer_app/common-widgets/sliding-button-cheat.dart';
import 'package:namer_app/draw-image/drawing-painter.dart';
import 'package:namer_app/draw-image/pixel.dart';
import 'package:namer_app/game-chat/game-chat-dialog.dart';
import 'package:namer_app/game-page/game-state.dart';
import 'package:namer_app/general-classes/coordinate.dart';
import 'package:namer_app/general-classes/first-game-mode.dart';
import 'package:namer_app/general-classes/game-card-info.dart';
import 'package:namer_app/general-classes/game.dart';
import 'package:namer_app/general-classes/oberserver-interaction-info.dart';
import 'package:namer_app/general-classes/player.dart';
import 'package:namer_app/limited-time/limited-time-service.dart';
import 'package:namer_app/player-score/player-score.dart';
import 'package:namer_app/selection-page/cards-state.dart';
import 'package:namer_app/timer/timer-service.dart';
import 'package:namer_app/timer/timer.dart';
import 'package:namer_app/video-replay/video-replay-state.dart';
import 'package:provider/provider.dart';

import '../common-widgets/gradient-background.dart';

class CooldownIndicator extends StatelessWidget {
  const CooldownIndicator({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var translationState = context.watch<TranslationState>();
    return Container(
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(width: 10),
          Text(
            translationState.currentLanguage['Cooldown: Wait 3s']!,
            style: TextStyle(color: Colors.white),
          ),
        ],
      ),
    );
  }
}

class DrawingArea {
  Offset? startPosition;
  Offset? currentPosition;
  bool isDrawing;
  bool hasDrawn;
  Color? color; // Add this field

  DrawingArea({
    this.startPosition,
    this.currentPosition,
    this.isDrawing = false,
    this.hasDrawn = false,
    this.color, // Initialize the color here
  });
}

class RectanglePainter extends CustomPainter {
  final Offset? startPosition;
  final Offset? currentPosition;
  final bool isDrawing;
  final bool hasDrawn;
  final Color color;

  RectanglePainter(
      {this.startPosition,
      this.currentPosition,
      required this.isDrawing,
      required this.hasDrawn,
      required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    if ((isDrawing || hasDrawn) &&
        startPosition != null &&
        currentPosition != null) {
      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0;

      double left = math.min(startPosition!.dx, currentPosition!.dx);
      double top = math.min(startPosition!.dy, currentPosition!.dy);
      double right = math.max(startPosition!.dx, currentPosition!.dx);
      double bottom = math.max(startPosition!.dy, currentPosition!.dy);

      canvas.drawRect(Rect.fromLTRB(left, top, right, bottom), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _MyGamePageState();
}

class _MyGamePageState extends State<GamePage> {
  List<Pixel> pixelsOriginal = [];
  List<Pixel> pixelsModified = [];
  late DrawingPainter drawingPainter;
  bool isInitialization = true;
  late GameState gameState;
  late CardsState cardState;
  late TranslationState translationState;
  late ThemeState themeState;
  late LimitedTimeService limitedTimeService;
  late TimerService timerService;
  late VideoReplayState videoReplayState;
  late Future<bool> areLimitedImagesLoaded;
  // ignore: avoid_init_to_null
  asyncTimer.Timer? _observerRectCooldownTimer;

  TextEditingController textFieldController = TextEditingController();
  bool isTextFieldEmpty = true;

  late bool _isRightSide;
  String? _selectedPlayerPseudo = 'all';
  late DrawingArea drawingAreaLeft;
  late DrawingArea drawingAreaRight;
  bool _isCooldownActive = false;
  GlobalKey _leftImageKey = GlobalKey();
  GlobalKey _rightImageKey = GlobalKey();
  @override
  void initState() {
    super.initState();

    drawingAreaLeft = DrawingArea();
    drawingAreaRight = DrawingArea();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      gameState = Provider.of<GameState>(context, listen: false);
      gameState.addListener(_drawObserverInteractionRectangle);
    });
  }

  @override
  void dispose() {
    gameState.removeListener(_drawObserverInteractionRectangle);
    textFieldController.dispose();
    gameState.timer?.cancel();
    _observerRectCooldownTimer?.cancel();
    super.dispose();
  }

  void _handlePanStartLeft(DragStartDetails details) {
    setState(() {
      _isRightSide = false;
      drawingAreaLeft.startPosition = details.localPosition;
      drawingAreaLeft.currentPosition = details.localPosition;
      drawingAreaLeft.isDrawing = true;
    });
  }

  void _handlePanStartRight(DragStartDetails details) {
    setState(() {
      _isRightSide = true;
      drawingAreaRight.startPosition = details.localPosition;
      drawingAreaRight.currentPosition = details.localPosition;
      drawingAreaRight.isDrawing = true;
    });
  }

  void _handlePanUpdateLeft(DragUpdateDetails details) {
    drawingAreaLeft.color = Colors.black;
    if (_leftImageKey.currentContext != null) {
      // Get the RenderBox for the left image using the GlobalKey
      RenderBox imageBox =
          _leftImageKey.currentContext!.findRenderObject() as RenderBox;
      Size imageSize = imageBox.size;

      // Now we use this size to clamp the position appropriately...
      Offset localPosition = imageBox.globalToLocal(details.globalPosition);
      double clampedX = localPosition.dx.clamp(0, imageSize.width);
      double clampedY = localPosition.dy.clamp(0, imageSize.height);

      setState(() {
        drawingAreaLeft.currentPosition = Offset(clampedX, clampedY);
      });
    }
  }

  void _handlePanUpdateRight(DragUpdateDetails details) {
    if (!gameState.isObserver || !drawingAreaRight.isDrawing) return;

    if (_rightImageKey.currentContext != null) {
      // Get the RenderBox for the right image using the GlobalKey
      RenderBox imageBox =
          _rightImageKey.currentContext!.findRenderObject() as RenderBox;
      Size imageSize = imageBox.size;

      // Convert the global position of the drag details to the local position relative to the right image
      Offset localPosition = imageBox.globalToLocal(details.globalPosition);

      // Now we use this size to clamp the position appropriately...
      double clampedX = localPosition.dx.clamp(0, imageSize.width);
      double clampedY = localPosition.dy.clamp(0, imageSize.height);

      setState(() {
        drawingAreaRight.currentPosition = Offset(clampedX, clampedY);
      });
    }
  }

  void _handlePanEndLeft(DragEndDetails details) {
    if (!drawingAreaLeft.isDrawing || _isCooldownActive) return;

    if (gameState.isObserver &&
        drawingAreaLeft.startPosition != null &&
        drawingAreaLeft.currentPosition != null) {
      List<Coordinate> boundaryCoordinates = _calculateBoundaryCoordinates(
        drawingAreaLeft.startPosition!,
        drawingAreaLeft.currentPosition!,
      );

      List<String> playerTarget = <String>[];
      if (_selectedPlayerPseudo == 'all') {
        gameState.playerService.opponents.forEach((Player player) {
          playerTarget.add(player.pseudo);
        });
      } else {
        playerTarget.add(_selectedPlayerPseudo!);
      }
      String roomName = gameState.observerGame.roomName;
      String sender = gameState.socket.gameSocket.id!;

      Map<String, dynamic> dataToSend = {
        'coords': boundaryCoordinates.map((coord) => coord.toJson()).toList(),
        'playerTarget': playerTarget,
        'roomName': roomName,
        'sender': sender,
        'isRightSide': false,
      };

      String jsonEncodedData = jsonEncode(dataToSend);
      gameState.socket.send('observerInteraction', jsonEncodedData);
    }

    setState(() {
      drawingAreaLeft.isDrawing = false;
      drawingAreaLeft.hasDrawn = true;
      _startCooldown(drawingAreaLeft);
    });
  }

  void _handlePanEndRight(DragEndDetails details) {
    if (!drawingAreaRight.isDrawing || _isCooldownActive) return;

    if (gameState.isObserver &&
        drawingAreaRight.startPosition != null &&
        drawingAreaRight.currentPosition != null) {
      List<Coordinate> boundaryCoordinates = _calculateBoundaryCoordinates(
        drawingAreaRight.startPosition!,
        drawingAreaRight.currentPosition!,
      );

      List<String> playerTarget = <String>[];
      if (_selectedPlayerPseudo == 'all') {
        gameState.playerService.opponents.forEach((Player player) {
          playerTarget.add(player.pseudo);
        });
      } else {
        playerTarget.add(_selectedPlayerPseudo!);
      }
      String roomName = gameState.observerGame.roomName;
      String sender = gameState.socket.gameSocket.id!;

      Map<String, dynamic> dataToSend = {
        'coords': boundaryCoordinates.map((coord) => coord.toJson()).toList(),
        'playerTarget': playerTarget,
        'roomName': roomName,
        'sender': sender,
        'isRightSide': true,
      };

      String jsonEncodedData = jsonEncode(dataToSend);
      gameState.socket.send('observerInteraction', jsonEncodedData);
    }

    setState(() {
      drawingAreaRight.isDrawing = false;
      drawingAreaRight.hasDrawn = true;
      _startCooldown(drawingAreaRight);
    });
  }

  void _startCooldown(DrawingArea drawingArea) {
    setState(() {
      _isCooldownActive = true;
    });

    asyncTimer.Timer(Duration(seconds: 3), () {
      setState(() {
        _isCooldownActive = false;
        drawingArea.color = Color.fromARGB(0, 255, 255, 255);
      });
    });
  }

  List<Coordinate> _calculateBoundaryCoordinates(Offset start, Offset end) {
    List<Coordinate> boundaryCoordinates = [];
    int left = math.min(start.dx.toInt(), end.dx.toInt());
    int top = math.min(start.dy.toInt(), end.dy.toInt());
    int right = math.max(start.dx.toInt(), end.dx.toInt());
    int bottom = math.max(start.dy.toInt(), end.dy.toInt());

    for (int x = left; x <= right; x++) {
      boundaryCoordinates.add(Coordinate(x: x, y: top));
    }

    for (int y = top; y <= bottom; y++) {
      boundaryCoordinates.add(Coordinate(x: right, y: y));
    }

    for (int x = right; x >= left; x--) {
      boundaryCoordinates.add(Coordinate(x: x, y: bottom));
    }

    for (int y = bottom; y >= top; y--) {
      boundaryCoordinates.add(Coordinate(x: left, y: y));
    }

    return boundaryCoordinates;
  }

  Coordinate _offsetToCoordinate(Offset position) {
    return Coordinate(x: position.dx.toInt(), y: position.dy.toInt());
  }

  void _drawObserverInteractionRectangle() {
    _observerRectCooldownTimer?.cancel();
    final ObserverInteractionInfo interactionData =
        gameState.observerRectangleData;

    if (interactionData.coords != []) {
      final List<Coordinate> boundaryCoordinates = (interactionData.coords);
      final bool isRightSide = interactionData.isRightSide;
      final Color color = gameState.getObserverColor(
          interactionData.senderId); // Retrieve color from the interactionData

      if (boundaryCoordinates.isNotEmpty) {
        if (isRightSide) {
          setState(() {
            drawingAreaRight.startPosition = Offset(
                boundaryCoordinates.first.x.toDouble(),
                boundaryCoordinates.first.y.toDouble());
            drawingAreaRight.currentPosition = Offset(
                boundaryCoordinates.last.x.toDouble(),
                boundaryCoordinates.last.y.toDouble());
            drawingAreaRight.isDrawing = true;
            drawingAreaRight.color = color;
            // Pass color to the painter as follows
            // Note: Define these global keys outside of initState so that they persist and don't get recreated every time
          });

          _observerRectCooldownTimer =
              asyncTimer.Timer(Duration(seconds: 2), () {
            setState(() {
              drawingAreaRight.color = Color.fromARGB(0, 255, 255, 255);
            });
          });
        } else {
          setState(() {
            drawingAreaLeft.startPosition = Offset(
                boundaryCoordinates.first.x.toDouble(),
                boundaryCoordinates.first.y.toDouble());
            drawingAreaLeft.currentPosition = Offset(
                boundaryCoordinates.last.x.toDouble(),
                boundaryCoordinates.last.y.toDouble());
            drawingAreaLeft.isDrawing = true;
            drawingAreaLeft.color = color;
            // Pass color to the painter as follows
            // Note: Define these global keys outside of initState so that they persist and don't get recreated every time
          });

          _observerRectCooldownTimer =
              asyncTimer.Timer(Duration(seconds: 2), () {
            setState(() {
              drawingAreaLeft.color = Color.fromARGB(0, 255, 255, 255);
            });
          });
        }
      }
    }
  }

  Widget _buildPlayerSelector() {
    List<Player> allPlayers = gameState.playerService.opponents;

    return DropdownButton<String>(
      value: _selectedPlayerPseudo,
      items: [
        DropdownMenuItem<String>(
          value: 'all',
          child: Text(
            translationState.currentLanguage['All players']!,
            style: TextStyle(
              color: themeState.currentTheme['Button foreground'],
            ),
          ),
        ),
        ...allPlayers.map((Player player) {
          return DropdownMenuItem<String>(
            value: player.pseudo,
            child: Text(
              player.pseudo,
              style: TextStyle(
                color: themeState.currentTheme['Button foreground'],
              ),
            ),
          );
        }).toList()
      ],
      onChanged: (String? newValue) {
        setState(() {
          _selectedPlayerPseudo = newValue ?? 'all';
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isInitialization) {
      isInitialization = false;
      gameState = context.watch<GameState>();
      cardState = context.watch<CardsState>();
      translationState = context.watch<TranslationState>();
      themeState = context.watch<ThemeState>();
      limitedTimeService = context.watch<LimitedTimeService>();
      timerService = context.watch<TimerService>();
      videoReplayState = context.watch<VideoReplayState>();
      Map<String, dynamic>? args =
          ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;

      String cardId = args?['cardId'] ?? '';
      String firstModeString = args?['firstMode'] ?? '';

      if (firstModeString != 'Limited') {
        GameCardInfo cardInfo = cardState.getCardById(cardId);
        gameState.cardInfo = cardInfo;

        gameState.game = Game(
            id: cardId,
            gameTitle: cardInfo.title,
            firstMode: FirstGameModeExtension.fromString(firstModeString),
            difficulty: cardInfo.difficultyLevel);
      } else {
        gameState.game = Game(
            id: 'Limited',
            gameTitle: 'Limited',
            firstMode: FirstGameMode.LIMITED_TIME,
            difficulty: 'easy');
      }
    }

    return Scaffold(
      //resizeToAvoidBottomInset: false,
      body: Container(
        decoration: gradientBackground(themeState),
        child: GestureDetector(
          onTap: gameState.isReplay ? null : () => {},
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      if (gameState.isObserver) _buildPlayerSelector(),
                      PlayerScore(
                        player: gameState.playerService.self,
                        hasRank: !gameState.isObserver,
                        hasScore: !gameState.isObserver,
                      ),
                      Column(
                        children: <Widget>[
                          const Timer(),
                          Visibility(
                            visible: gameState.constantsData.isCheatMode,
                            child: Padding(
                              padding: const EdgeInsets.all(5),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    translationState
                                        .currentLanguage['Cheat mode']!,
                                    style: TextStyle(
                                        color: themeState
                                            .currentTheme['Button foreground']),
                                  ),
                                  const SizedBox(width: 10),
                                  SlidingButtonCheat(
                                    isCheatModeOn: gameState.isCheatModeOn,
                                    onTap: gameState.videoReplayToggleFlash,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 35,
                            child: Offstage(
                              offstage: !gameState.isClickDisabledOnError,
                              child: Text(
                                translationState.currentLanguage['Error']!,
                                style: const TextStyle(
                                  color: Colors.red,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      // Players 2-3-4
                      SizedBox(
                        width: gameState.playerService.opponents.length * 160,
                        height: 90,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: gameState.playerService.opponents.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 10),
                              child: PlayerScore(
                                player:
                                    gameState.playerService.opponents[index],
                                hasRank: true,
                                hasScore: gameState.game.firstMode !=
                                        FirstGameMode.LIMITED_TIME ||
                                    (index == 0 && gameState.isObserver),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: <Widget>[
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        border: Border.all(
                          color: Colors.white,
                          width: 2,
                        ),
                      ),
                      child: GestureDetector(
                        key: _leftImageKey,
                        onPanStart: gameState.isObserver && !_isCooldownActive
                            ? _handlePanStartLeft
                            : null,
                        onPanUpdate: gameState.isObserver && !_isCooldownActive
                            ? _handlePanUpdateLeft
                            : null,
                        onPanEnd: gameState.isObserver && !_isCooldownActive
                            ? _handlePanEndLeft
                            : null,
                        onTapDown: (TapDownDetails details) {
                          if (!gameState.isClickDisabledOnError &&
                              !gameState.isObserver) {
                            Offset position = details.localPosition;
                            print("Tap Position: $position");
                            Coordinate coordinate = Coordinate(
                              x: position.dx.floor(),
                              y: position.dy.floor(),
                            );
                            gameState.socket
                                .send('handleClick', jsonEncode(coordinate));
                          }
                        },
                        child: Builder(builder: (context) {
                          if (gameState.game.firstMode ==
                                  FirstGameMode.CLASSIC ||
                              gameState.game.firstMode ==
                                  FirstGameMode.REFLEX) {
                            return Stack(
                              children: <Widget>[
                                Image(
                                  image: MemoryImage(gameState.originalImage),
                                ),
                                for (Uint8List filter
                                    in gameState.activeOriginalFilters)
                                  Image(image: MemoryImage(filter)),
                                for (Uint8List filter
                                    in gameState.originalImageFilters)
                                  Visibility(
                                      visible: gameState.isCheatModeOn &&
                                          gameState.isFlashVisible,
                                      child: Image(image: MemoryImage(filter))),
                                // if (gameState.isObserver)
                                CustomPaint(
                                  painter: RectanglePainter(
                                    startPosition:
                                        drawingAreaLeft.startPosition,
                                    currentPosition:
                                        drawingAreaLeft.currentPosition,
                                    isDrawing: drawingAreaLeft.isDrawing,
                                    hasDrawn: drawingAreaLeft.hasDrawn,
                                    color:
                                        drawingAreaLeft.color ?? Colors.black,
                                  ),
                                  child: Container(),
                                ),
                              ],
                            );
                          } else {
                            return FutureBuilder<bool>(
                                future: gameState.areLimitedImagesLoaded,
                                builder: (context, snapshot) {
                                  if (snapshot.hasData && snapshot.data!) {
                                    return Stack(
                                      children: <Widget>[
                                        Image(
                                          image: MemoryImage(
                                            limitedTimeService
                                                .getCurrentOriginalImage(),
                                          ),
                                        ),
                                        Visibility(
                                          visible: gameState.isCheatModeOn &&
                                              gameState.isFlashVisible,
                                          child: Image(
                                            image: MemoryImage(
                                                limitedTimeService
                                                    .getCurrentLeftFilter()),
                                          ),
                                        ),
                                        CustomPaint(
                                          painter: RectanglePainter(
                                            startPosition:
                                                drawingAreaLeft.startPosition,
                                            currentPosition:
                                                drawingAreaLeft.currentPosition,
                                            isDrawing:
                                                drawingAreaLeft.isDrawing,
                                            hasDrawn: drawingAreaLeft.hasDrawn,
                                            color: drawingAreaLeft.color ??
                                                Colors.black,
                                          ),
                                          child: Container(),
                                        ),
                                      ],
                                    );
                                  } else {
                                    return const Center(
                                      child: CircularProgressIndicator(),
                                    );
                                  }
                                });
                          }
                        }),
                      ),
                    ),
                    const SizedBox(width: 40),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(0),
                        border: Border.all(
                          color: Colors.white,
                          width: 2,
                        ),
                      ),
                      child: GestureDetector(
                        key: _rightImageKey,
                        onPanStart: gameState.isObserver && !_isCooldownActive
                            ? _handlePanStartRight
                            : null,
                        onPanUpdate: gameState.isObserver && !_isCooldownActive
                            ? _handlePanUpdateRight
                            : null,
                        onPanEnd: gameState.isObserver && !_isCooldownActive
                            ? _handlePanEndRight
                            : null,
                        onTapDown: (TapDownDetails details) {
                          if (!gameState.isClickDisabledOnError &&
                              !gameState.isObserver) {
                            Offset position = details.localPosition;
                            print("Tap Position: $position");
                            Coordinate coordinate = Coordinate(
                              x: position.dx.floor(),
                              y: position.dy.floor(),
                            );
                            gameState.socket
                                .send('handleClick', jsonEncode(coordinate));
                          }
                        },
                        child: Builder(builder: (context) {
                          if (gameState.game.firstMode ==
                                  FirstGameMode.CLASSIC ||
                              gameState.game.firstMode ==
                                  FirstGameMode.REFLEX) {
                            return Stack(
                              children: <Widget>[
                                Image(
                                  image: MemoryImage(gameState.modifiedImage),
                                ),
                                for (Uint8List filter
                                    in gameState.activeFilters)
                                  Image(image: MemoryImage(filter)),
                                for (Uint8List filter in gameState.allFilters)
                                  Visibility(
                                      visible: gameState.isCheatModeOn &&
                                          !gameState.isFlashVisible,
                                      child: Image(image: MemoryImage(filter))),
                                // 2e custom painter pareil
                                // if (gameState.isObserver)
                                CustomPaint(
                                  painter: RectanglePainter(
                                    startPosition:
                                        drawingAreaRight.startPosition,
                                    currentPosition:
                                        drawingAreaRight.currentPosition,
                                    isDrawing: drawingAreaRight.isDrawing,
                                    hasDrawn: drawingAreaRight.hasDrawn,
                                    color:
                                        drawingAreaRight.color ?? Colors.black,
                                  ),
                                  child: Container(),
                                ),
                              ],
                            );
                          } else {
                            return FutureBuilder<bool>(
                                future: gameState.areLimitedImagesLoaded,
                                builder: (context, snapshot) {
                                  if (snapshot.hasData && snapshot.data!) {
                                    return Stack(
                                      children: <Widget>[
                                        Image(
                                          image: MemoryImage(limitedTimeService
                                              .getCurrentOriginalImage()),
                                        ),
                                        Image(
                                          image: MemoryImage(limitedTimeService
                                              .getCurrentLeftFilter()),
                                        ),
                                        Visibility(
                                          visible: gameState.isCheatModeOn &&
                                              gameState.isFlashVisible,
                                          child: Image(
                                            image: MemoryImage(
                                                limitedTimeService
                                                    .getCurrentRightFilter()),
                                          ),
                                        ),
                                        CustomPaint(
                                          painter: RectanglePainter(
                                            startPosition:
                                                drawingAreaRight.startPosition,
                                            currentPosition: drawingAreaRight
                                                .currentPosition,
                                            isDrawing:
                                                drawingAreaRight.isDrawing,
                                            hasDrawn: drawingAreaRight.hasDrawn,
                                            color: drawingAreaRight.color ??
                                                Colors.black,
                                          ),
                                          child: Container(),
                                        ),
                                      ],
                                    );
                                  } else {
                                    return const Center(
                                      child: CircularProgressIndicator(),
                                    );
                                  }
                                });
                          }
                        }),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: Stack(
        children: <Widget>[
          Positioned(
            bottom: 20,
            right: 300,
            child: Visibility(
              visible: _isCooldownActive,
              child: const CooldownIndicator(),
            ),
          ),
          Positioned(
            bottom: 10,
            left: 10,
            child: Container(
              alignment: Alignment.bottomLeft,
              child: SizedBox(
                width: 200,
                height: 60,
                child: FloatingActionButton(
                  heroTag: 'abandonButton',
                  onPressed: gameState.isReplay
                      ? () {
                          videoReplayState.events = [];
                          videoReplayState.changeIsReplayButtonActive(true);
                          videoReplayState.isVideoReplayDialog = false;
                          videoReplayState.stop();
                          gameState.abandonGame(false);
                        }
                      : () {
                          videoReplayState.addGameEventToEvents(
                              'startFlash',
                              [],
                              DateTime.now().millisecondsSinceEpoch -
                                  gameState.startTimeSinceEpoch);
                          gameState.stopFlash();
                          showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return AlertDialog(
                                backgroundColor: themeState
                                    .currentTheme['Dialog Background'],
                                content: SizedBox(
                                  height:
                                      MediaQuery.of(context).size.height / 2,
                                  child: const AbandonGameDialog(),
                                ),
                              );
                            },
                          );
                        },
                  child: Text(
                    gameState.isObserver || gameState.isReplay
                        ? translationState.currentLanguage['Close']!
                        : translationState.currentLanguage['Give up game']!,
                    style: TextStyle(
                        color: themeState.currentTheme['Button foreground']),
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 80,
            left: 525,
            child: Row(
              children: [
                Visibility(
                  visible: gameState.isReplay,
                  child: FloatingActionButton(
                    heroTag: 'play',
                    onPressed: () {
                      (videoReplayState.isPaused)
                          ? videoReplayState.play()
                          : videoReplayState.pause();
                    },
                    child: Icon(
                      ((videoReplayState.isPaused)
                          ? Icons.play_arrow
                          : Icons.pause),
                      color: themeState.currentTheme['Button foreground'],
                    ),
                  ),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: const SizedBox(width: 5),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: FloatingActionButton(
                    heroTag: 'setSpeed1',
                    onPressed: () {
                      videoReplayState.setSpeed(1);
                    },
                    child: Text(
                      'X1',
                      style: TextStyle(
                          color: themeState.currentTheme['Button foreground']),
                    ),
                  ),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: const SizedBox(width: 5),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: FloatingActionButton(
                    heroTag: 'setSpeed2',
                    onPressed: () {
                      videoReplayState.setSpeed(2);
                    },
                    child: Text(
                      'X2',
                      style: TextStyle(
                          color: themeState.currentTheme['Button foreground']),
                    ),
                  ),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: const SizedBox(width: 5),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: FloatingActionButton(
                    heroTag: 'setSpeed4',
                    onPressed: () {
                      videoReplayState.setSpeed(4);
                    },
                    child: Text(
                      'X4',
                      style: TextStyle(
                          color: themeState.currentTheme['Button foreground']),
                    ),
                  ),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: const SizedBox(width: 5),
                ),
                Visibility(
                  visible: gameState.isReplay,
                  child: FloatingActionButton(
                    heroTag: 'restart',
                    onPressed: () {
                      videoReplayState.restart();
                    },
                    child: Icon(
                      Icons.restart_alt,
                      color: themeState.currentTheme['Button foreground'],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 10,
            left: 480,
            child: Visibility(
              visible: gameState.isReplay,
              child: SizedBox(
                width: 400,
                child: Slider(
                  allowedInteraction: SliderInteraction.tapOnly,
                  min: 0,
                  max: videoReplayState.events.isNotEmpty
                      ? videoReplayState
                          .events[videoReplayState.events.length - 1].timestamp
                          .toDouble()
                      : 0,
                  value: videoReplayState.currentTime.toDouble(),
                  onChangeStart: (newValue) {},
                  onChanged: (newValue) {
                    videoReplayState.currentTime = newValue.floor();
                    int flooredValue = newValue.floor();
                    videoReplayState
                        .changeTime(flooredValue - (flooredValue % 10));
                  },
                  onChangeEnd: (newValue) {},
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 10,
            right: 10,
            child: FloatingActionButton(
              heroTag: 'gameChatButton',
              onPressed: () {
                showDialog(
                  barrierDismissible: false,
                  context: context,
                  builder: (BuildContext context) {
                    return (gameState.isReplay)
                        ? const ChatPage()
                        : GameChatDialog();
                  },
                );
              },
              child: Icon(
                Icons.chat,
                color: themeState.currentTheme['Button foreground'],
              ),
            ),
          ),
          Positioned(
            bottom: 20,
            left: MediaQuery.of(context).size.width * 0.45,
            child: Visibility(
              visible: gameState.gameIsWatched && !gameState.isObserver,
              child: Text(
                '${translationState.currentLanguage['Game is being watched by ']!}${gameState.observerCount}',
                style: TextStyle(
                  fontSize: 20,
                  color: themeState.currentTheme['Button foreground'],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
