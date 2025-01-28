import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { FriendsPageComponent } from '@app/pages/friends-page/friends-page.component';
import { GameCreationComponent } from '@app/pages/game-creation/game-creation.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedTimeLobbiesComponent } from '@app/pages/limited-time-lobbies/limited-time-lobbies.component';
import { LobbyWaitingRoomComponent } from '@app/pages/lobby-waiting-room/lobby-waiting-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ObserverPageComponent } from '@app/pages/observer-page/observer-page.component';
import { ProfilePageComponent } from '@app/pages/profile-page/profile-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { SharedVideoReplayComponent } from '@app/pages/shared-video-replay/shared-video-replay.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'config', component: ConfigurationPageComponent },
    { path: 'options/classic', component: SelectionPageComponent },
    { path: 'options/limited', component: LimitedTimeLobbiesComponent },
    { path: 'gameCreation', component: GameCreationComponent },
    { path: 'profile', component: ProfilePageComponent },
    { path: 'lobby', component: LobbyWaitingRoomComponent },
    { path: 'observer', component: ObserverPageComponent },
    { path: 'friends', component: FriendsPageComponent },
    { path: 'options/limited/lobbies', component: LimitedTimeLobbiesComponent },
    { path: 'videos', component: SharedVideoReplayComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
