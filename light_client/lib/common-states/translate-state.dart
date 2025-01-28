import 'package:flutter/material.dart';

class TranslationState extends ChangeNotifier {
  Map<String, String> french = {
    'A password is required': 'Le mot de passe est requis',
    'A username is required': 'Le pseudo est requis',
    'Accept': 'Accepter',
    'Account already in use': "Le compte est déjà en cours d'utilisation",
    'Account creation page': 'Création de compte',
    'Activated': 'Activé',
    'Activity': 'Activité',
    'All players': 'Tous les joueurs',
    'Add as friend': 'Ajouter comme amis',
    'An email is required': 'Le courriel est requis',
    'An error occurred on the server.':
        'Une erreur est survenue au niveau du serveur.',
    'Are you sure you want to block this account?':
        'Êtes vous certain de vouloir bloquer ce compte?',
    'Are you sure you want to remove this friend?':
        'Êtes-vous certain de vouloir retirer cet ami?',
    'Are you sure you want to return to main menu?':
        'Êtes vous certain de vouloir retourner au menu principal?',
    'Are you sure you want to unblock this account?':
        'Êtes vous certain de vouloir débloquer ce compte?',
    'Are you sure you want to give up the game and return to main menu?':
        'Êtes-vous certain de vouloir abandonner la partie et retourner au menu principal?',
    'Average differences found per game':
        'Nombre moyen de différences trouvées par partie',
    'Average time per game': 'Temps moyen par partie',
    'Back': 'Retour',
    'Block': 'Bloquer',
    'Card deleted': 'Carte supprimée',
    'Cancel': 'Annuler',
    'Change username': 'Changer le pseudo',
    'Cheat mode': 'Mode triche',
    'classique': 'Classique',
    'Classic': 'Classique',
    'Close': 'Fermer',
    'Cooldown: Wait 3s': "Temps d'attente: attendre 3s",
    'Connect': 'Se connecter',
    'Connection': 'Connexion',
    'Confirm': 'Confirmer',
    'Confirm action': "Confirmer l'action",
    'Confirm password': 'Confirmation mot de passe',
    'Create': 'Créer',
    'Create Coop': 'Créer Coop',
    'Create a game': 'Créer une partie',
    'Create an account': 'Créer un compte',
    'Creator': 'Créateur',
    'DEFEAT! You lost': 'DÉFAITE! Vous avez perdu',
    'Difference count': 'Nombre de différences',
    'Differences left': 'Différences restantes',
    'Difficulty': 'Difficulté',
    'Disabled': 'Désactivé',
    'Email': 'Courriel',
    'email@domain.com': 'courriel@domaine.com',
    'Enter email to recover password.':
        'Veuillez entrer le courriel pour récupérer le mot de passe.',
    'Enter new username': 'Entrer nouveau pseudo',
    'Enter the code you received by email and your new password.':
        'Veuillez entrer le code que vous avez reçu par courriel et votre nouveau mot de passe.',
    'Error': 'Erreur',
    'Existing account': 'Compte existant',
    'Existing username': 'Pseudo existant',
    'Forgot Password?': 'Oublié le mot de passe?',
    'Friends': 'Amis',
    'Friends of friends': 'Amis des amis',
    'Gained time (s)': 'Temps gagné (s)',
    'Game chat': 'Messagerie de jeux',
    'Game creator has left the lobby':
        "Le créateur de la partie a quitté la salle d'attente",
    'Game constants': 'Constantes de jeu',
    'Game is being watched by ': 'La partie est en observation par ',
    'Game history': 'Historique des parties',
    'Game type': 'Type de partie',
    'Give up game': 'Give up game',
    'Global chat': 'Messagerie global',
    'Incorrect information': 'Informations erronées',
    'Initial time (s)': 'Temps initial (s)',
    'Internal error': 'Erreur interne',
    'Invalid username: must be 1-40 characters':
        'Pseudo invalide: doit contenir 1-40 caractères',
    'Join': 'Rejoindre',
    'Join as observer': 'Rejoindre comme observateur',
    'Joining': 'En processus de rejoindre',
    'as observer...': "en tant qu'observateur...",
    'Leave': 'Quitter',
    'Level': 'Niveau',
    'Lobby': 'Salle',
    'Lobby broken': "Salle d'attente brisée",
    'Log out': 'Déconnexion',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'Logged out successfully': 'Déconnexion avec succès',
    'Loser': 'Perdant',
    'Limited': 'Limité',
    'Limited Time': 'Temps Limité',
    'newPassword': 'nouveauMotDePasse',
    'No cards available to play!': 'Aucune carte disponible pour jouer!',
    'No invite received': 'Aucune invitation reçue',
    'No player found': 'Aucun joueur trouvé',
    'No friend to show': 'Aucun ami à afficher',
    'No replays available to play!': 'Aucune vidéo trouvé',
    'Not authorized': 'Non autorisé',
    'Number of differences': 'Nombre de differences',
    'Number of games played': 'Nombre de parties jouées',
    'Number of games won': 'Nombre de parties gagnées',
    'Observer': 'Observateur',
    'Observer page': "Page des observateurs",
    'Observer(s) currently spectating': "Observateur(s) en train d'assister",
    'Password': 'Mot de passe',
    'Penalty time (s)': 'Temps de pénalité (s)',
    'Play': 'Jouer',
    'Player list': 'Liste de joueurs',
    'Players': 'Joueurs',
    'Player(s) in game': 'Joueur(s) dans la partie',
    'Profile': 'Profil',
    'Profile Page': 'Page de profile',
    'Friend requests': "Demande d'amis",
    'Search': 'Recherche',
    'Public': 'Publique',
    'Rank': 'Classement',
    'reflex': 'Réflèxe',
    'Reflex': 'Réflèxe',
    'Refuse': 'Refuser',
    'Replay the game': 'Revoir la partie',
    'Save replay': 'Sauvegarder la reprise',
    'Selection menu': 'Menu de sélection',
    'Show profile': 'Afficher le profil',
    'Start': 'Commencer',
    'Stop video': 'Arrêter la vidéo',
    'The email must contain a maximum of 50 characters.':
        'Le courriel doit contenir au plus 50 caractères.',
    'The game card for the current lobby has been deleted':
        "La carte pour la salle d'attente en cours a été supprimée",
    'The game has ended': 'La partie est finie',
    'The password must contain at least 8 characters.':
        'Le mot de passe doit contenir au moins 8 caractères.',
    'The passwords must be identical':
        'Les mots de passe doivent être identiques',
    'The provided information does not belong to an existing account.':
        'Les informations entrées ne correspondent pas à un compte existant.',
    'There are no more cards available to play with':
        "Il n'y a plus de cartes disponibles pour jouer",
    'The username can contain a maximum of 50 characters.':
        'Le pseudo doit contenir au plus 50 caractères.',
    'The username you have chosen is already taken. Please try another one.':
        'Le pseudo que vous avez choisi est déjà pris. Veuillez en choisir un autre.',
    'This email is already in use by another account.':
        'Ce courriel est déjà occupé par un autre compte.',
    'This username is already in use by another account.':
        'Ce pseudo est déjà occupé par un autre compte.',
    'Time gained for a success': 'Temps gagné pour un succès',
    'Time': 'Heure',
    'Time lost for a failure': 'Temps perdu pour un échec',
    'Username': 'Pseudo',
    'Username not available': 'Pseudo non disponible',
    'Value between 1 and 30 seconds required':
        'Valeur entre 1 et 30 secondes requise',
    'Value between 1 and 45 seconds required':
        'Valeur entre 1 et 45 secondes requise',
    'Value between 30 and 120 seconds required':
        'Valeur entre 30 et 120 secondes requise',
    'Waiting for players': 'En attente de joueurs',
    'Winner': 'Gagnant',
    'Write message...': 'Écrit un message...',
    'You have lost!': 'Vous avez perdu!',
    'VICTORY! You won': 'VICTOIRE! Vous avez gagné',
    'Video replay': 'Reprise vidéo',
    'You must confirm the new constants':
        'Vous devez confirmer les nouvelles constantes',
    "'s profile": "",
    'Profil de': 'Profil de',
    "'s friends": "",
    'Amis de': 'Amis de ',
    'Bronze': 'Bronze',
    'Silver': 'Argent',
    'Gold': 'Or',
    'Platinum': 'Platine',
    'Video Replay': 'Reprise vidéo',
    'Private': 'Privée',
    'Card': 'Carte',
    'Are you sure you want to make this video private?':
        'Êtes-vous certain de vouloir rendre cette reprise vidéo privée?',
    'Are you sure you want to remove this video replay?':
        'Êtes-vous certain de vouloir retirer cette reprise vidéo?',
    'Are you sure you want to make this video public?':
        'Êtes-vous certain de vouloir rendre cette reprise vidéo publique?',
    'Your partner quit!': 'Votre partenaire a quitté la partie!',
  };

  Map<String, String> english = {
    'A password is required': 'A password is required',
    'Are you sure you want to abandon the game and return to main menu?':
        'Are you sure you want to abandon the game and return to main menu?',
    'A username can contain a maximum of 50 characters.':
        'A username can contain a maximum of 50 characters.',
    'A username is required': 'A username is required',
    'Account already in use': 'Account already in use',
    'Account creation page': 'Account creation page',
    'Activated': 'Activated',
    'Activity': 'Activity',
    'All players': 'All players',
    'An email is required': 'An email is required',
    'An error occurred on the server.': 'An error occurred on the server.',
    'Are you sure you want to block this account?':
        'Are you sure you want to block this account?',
    'Are you sure you want to remove this friend?':
        'Are you sure you want to remove this friend?',
    'Are you sure you want to return to main menu?':
        'Are you sure you want to return to main menu?',
    'Are you sure you want to unblock this account?':
        'Are you sure you want to unblock this account?',
    'Are you sure you want to give up the game and return to main menu?':
        'Are you sure you want to give up the game and return to main menu?',
    'Average time per game': 'Average time per game',
    'Average differences found per game': 'Average differences found per game',
    'Back': 'Back',
    'Card deleted': 'Card deleted',
    'Cancel': 'Cancel',
    'Change username': 'Change username',
    'Cheat mode': 'Cheat mode',
    'Close': 'Close',
    'classique': 'Classic',
    'Classic': 'Classic',
    'Cooldown: Wait 3s': 'Cooldown: Wait 3s',
    'Connect': 'Connect',
    'Connection': 'Connection',
    'Confirm': 'Confirm',
    'Confirm action': 'Confirm action',
    'Confirm password': 'Confirm password',
    'Create': 'Create',
    'Create Coop': 'Create Coop',
    'Create a game': 'Create a game',
    'Create an account': 'Create an account',
    'Creator': 'Creator',
    'DEFEAT! You lost': 'DEFEAT! You lost',
    'Difficulty': 'Difficulty',
    'Difference count': 'Difference count',
    'Differences left': 'Differences left',
    'Disabled': 'Disabled',
    'Email': 'Email',
    'email@domain.com': 'email@domain.com',
    'Enter email to recover password.': 'Enter email to recover password.',
    'Enter new username': 'Enter new username',
    'Enter the code you received by email and your new password.':
        'Enter the code you received by email and your new password.',
    'Error': 'Error',
    'Existing account': 'Existing account',
    'Existing username': 'Existing username',
    'Forgot Password?': 'Forgot Password?',
    'Friends': 'Friends',
    'Friends of friends': 'Friends of friends',
    'Gained time (s)': 'Gained time (s)',
    'Game chat': 'Game chat',
    'Game creator has left the lobby': 'Game creator has left the lobby',
    'Game constants': 'Game constants',
    'Game is being watched by ': 'Game is being watched by ',
    'Game history': 'Game history',
    'Game type': 'Game type',
    'Give up game': 'Give up game',
    'Global chat': 'Global chat',
    'Incorrect information': 'Incorrect information',
    'Initial time (s)': 'Initial time (s)',
    'Internal error': 'Internal error',
    'Invalid username: must be 1-40 characters':
        'Invalid username: must be 1-40 characters',
    'Join': 'Join',
    'Join as observer': 'Join as observer',
    'Joining': 'Joining',
    'as observer...': 'as observer...',
    'Leave': 'Leave',
    'Level': 'Level',
    'Lobby': 'Lobby',
    'Lobby broken': 'Lobby broken',
    'Log out': 'Log out',
    'login': 'Log in',
    'logout': 'Log out',
    'Logged out successfully': 'Logged out successfully',
    'Loser': 'Loser',
    'Limited': 'Limited',
    'Limited Time': 'Limited Time',
    'newPassword': 'newPassword',
    'No cards available to play!': 'No cards available to play!',
    'No invite received': 'No invite received',
    'No player found': 'No player found',
    'No friend to show': 'No friend to show',
    'Not authorized': 'Not authorized',
    'No replays available to play!': 'No replays available to play!',
    'Number of differences': 'Number of differences',
    'Number of games played': 'Number of games played',
    'Number of games won': 'Number of games won',
    'Observer': 'Observer',
    'Observer page': 'Observer page',
    'Observer(s) currently spectating': 'Observer(s) currently spectating',
    'Password': 'Password',
    'Penalty time (s)': 'Penalty time (s)',
    'Play': 'Play',
    'Player list': 'Player list',
    'Players': 'Players',
    'Player(s) in game': 'Player(s) in game',
    'Profile': 'Profile',
    'Profile Page': 'Profile Page',
    'Friend requests': 'Friend requests',
    'Search': 'Search',
    'Public': 'Public',
    'Rank': 'Rank',
    'reflex': 'Reflex',
    'Reflex': 'Reflex',
    'Replay the game': 'Replay the game',
    'Save replay': 'Save replay',
    'Selection menu': 'Selection menu',
    'Show profile': 'Show profile',
    'Start': 'Start',
    'Stop video': 'Stop video',
    'The email must contain a maximum of 50 characters.':
        'The email must contain a maximum of 50 characters.',
    'The game card for the current lobby has been deleted':
        'The game card for the current lobby has been deleted',
    'The game has ended': 'The game has ended',
    'The password must contain at least 8 characters.':
        'The password must contain at least 8 characters.',
    'The passwords must be identical': 'The passwords must be identical',
    'The provided information does not belong to an existing account.':
        'The provided information does not belong to an existing account.',
    'There are no more cards available to play with':
        'There are no more cards available to play with',
    'The username can contain a maximum of 50 characters.':
        'The username can contain a maximum of 50 characters.',
    'The username you have chosen is already taken. Please try another one.':
        'The username you have chosen is already taken. Please try another one.',
    'This email is already in use by another account.':
        'This email is already in use by another account.',
    'This username is already in use by another account.':
        'This username is already in use by another account.',
    'Time': 'Time',
    'Time gained for a success': 'Time gained for a success',
    'Time lost for a failure': 'Time lost for a failure',
    'Username': 'Username',
    'Username not available': 'Username not available',
    'Value between 1 and 30 seconds required':
        'Value between 1 and 30 seconds required',
    'Value between 1 and 45 seconds required':
        'Value between 1 and 45 seconds required',
    'Value between 30 and 120 seconds required':
        'Value between 30 and 120 seconds required',
    'Waiting for players': 'Waiting for players',
    'Winner': 'Winner',
    'Write message...': 'Write message...',
    'You have lost!': 'You have lost!',
    'VICTORY! You won': 'VICTORY! You won',
    'Video replay': 'Video replay',
    'You must confirm the new constants': 'You must confirm the new constants',
    "'s profile": "'s profile",
    'Profil de': '',
    "'s friends": "'s friends",
    'Amis de': '',
    'Bronze': 'Bronze',
    'Silver': 'Silver',
    'Gold': 'Gold',
    'Platinum': 'Platinum',
    'Video Replay': 'Video Replay',
    'Private': 'Private',
    'Card': 'Card',
    'Are you sure you want to make this video private?':
        'Are you sure you want to make this video private?',
    'Are you sure you want to remove this video replay?':
        'Are you sure you want to remove this video replay?',
    'Are you sure you want to make this video public?':
        'Are you sure you want to make this video public?',
    'Your partner quit!': 'Your partner quit!',
  };

  late Map<String, String> currentLanguage = english;
  late String currentLanguageString = "en";

  TranslationState._internal();

  static final TranslationState _instance = TranslationState._internal();

  factory TranslationState() {
    return _instance;
  }

  static TranslationState get instance => _instance;

  void setLanguage(String receivedSymbol) {
    if (receivedSymbol == 'en') {
      currentLanguage = english;
      currentLanguageString = 'en';
    } else if (receivedSymbol == 'fr') {
      currentLanguage = french;
      currentLanguageString = 'fr';
    } else {
      currentLanguage = english;
      currentLanguageString = 'en';
    }
    notifyListeners();
  }
}
