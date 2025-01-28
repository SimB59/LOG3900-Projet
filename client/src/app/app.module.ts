/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GameCreationComponent } from '@app/pages/game-creation/game-creation.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { AbandonConfirmationComponent } from './components/abandon-confirmation/abandon-confirmation.component';
import { AccountLoadingComponent } from './components/account-loading/account-loading.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { AvatarSelectionComponent } from './components/avatar-selection/avatar-selection.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BlockPlayerComponent } from './components/block-player/block-player.component';
import { CardCreationComponent } from './components/card-creation/card-creation.component';
import { CardDrawingComponent } from './components/card-drawing/card-drawing.component';
import { CardsValidationComponent } from './components/cards-validation/cards-validation.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { DeleteAllCardsConfirmationComponent } from './components/delete-all-cards-confirmation/delete-all-cards-confirmation.component';
import { DifferenceCountComponent } from './components/difference-count/difference-count.component';
import { EndGameComponent } from './components/end-game/end-game.component';
import { GameConstantsLobbyComponent } from './components/game-constants-lobby/game-constants-lobby.component';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { GameInformationComponent } from './components/game-information/game-information.component';
import { GameLoadingComponent } from './components/game-loading/game-loading.component';
import { HistoryComponent } from './components/history/history.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LimitedTimeLobbyComponent } from './components/limited-time-lobby/limited-time-lobby.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { NameQueryComponent } from './components/name-query/name-query.component';
import { PasswordLockComponent } from './components/password-lock/password-lock.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { PlayerInvitesComponent } from './components/player-invites/player-invites.component';
import { PlayerJoinComponent } from './components/player-join/player-join.component';
import { PopupMessageComponent } from './components/popup-message/popup-message.component';
import { ProfileCreationComponent } from './components/profile-creation/profile-creation.component';
import { PseudoComponent } from './components/pseudo/pseudo.component';
import { ResetAllStatsConfirmationComponent } from './components/reset-all-stats-confirmation/reset-all-stats-confirmation.component';
import { SelectionAreaComponent } from './components/selection-area/selection-area.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { ToolBoxComponent } from './components/tool-box/tool-box.component';
import { VideoReplayControlComponent } from './components/video-replay-control/video-replay-control.component';
import { VideoReplayComponent } from './components/video-replay/video-replay.component';
import { ViewCreateLobbyComponent } from './components/view-create-lobby/view-create-lobby.component';
import { ViewLobbyPlayersComponent } from './components/view-lobby-players/view-lobby-players.component';
import { ObserverInteractionComponent } from './observer-interaction/observer-interaction.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { FriendsPageComponent } from './pages/friends-page/friends-page.component';
import { LimitedModeComponent } from './pages/limited-mode/limited-mode.component';
import { LimitedTimeLobbiesComponent } from './pages/limited-time-lobbies/limited-time-lobbies.component';
import { LobbyWaitingRoomComponent } from './pages/lobby-waiting-room/lobby-waiting-room.component';
import { ObserverPageComponent } from './pages/observer-page/observer-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SharedVideoReplayComponent } from './pages/shared-video-replay/shared-video-replay.component';
import { RectangleSelectDirective } from './rectangle-select.directive';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SelectionPageComponent,
        LeaderboardComponent,
        CardComponent,
        TimerComponent,
        GameInformationComponent,
        DifferenceCountComponent,
        SelectionAreaComponent,
        ConfigurationPageComponent,
        CardsValidationComponent,
        GameCreationComponent,
        CardCreationComponent,
        ToolBoxComponent,
        CardDrawingComponent,
        ChatBoxComponent,
        LobbyComponent,
        PlayerJoinComponent,
        NameQueryComponent,
        LimitedModeComponent,
        HistoryComponent,
        PopupMessageComponent,
        VideoReplayControlComponent,
        GameConstantsComponent,
        EndGameComponent,
        DeleteAllCardsConfirmationComponent,
        ResetAllStatsConfirmationComponent,
        AbandonConfirmationComponent,
        GameLoadingComponent,
        AuthenticationComponent,
        ProfileCreationComponent,
        AvatarComponent,
        ProfilePageComponent,
        ToggleComponent,
        PseudoComponent,
        PasswordResetComponent,
        ViewLobbyPlayersComponent,
        LobbyWaitingRoomComponent,
        GameConstantsLobbyComponent,
        AvatarSelectionComponent,
        PasswordLockComponent,
        AccountLoadingComponent,
        ObserverPageComponent,
        FriendsPageComponent,
        LimitedTimeLobbiesComponent,
        LimitedTimeLobbyComponent,
        SharedVideoReplayComponent,
        VideoReplayComponent,
        ObserverInteractionComponent,
        RectangleSelectDirective,
        PlayerInvitesComponent,
        BlockPlayerComponent,
        SharedVideoReplayComponent,
        VideoReplayComponent,
        ViewCreateLobbyComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        ReactiveFormsModule,
        MatInputModule,
        MatDialogModule,
        MatIconModule,
        MatCheckboxModule,
    ],
    providers: [DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule {}
