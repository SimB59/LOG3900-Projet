// /* eslint-disable import/no-deprecated */
// /* eslint-disable deprecation/deprecation */
// import { HttpClientModule } from '@angular/common/http';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import {
//     MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
//     MatLegacyDialogModule as MatDialogModule,
//     MatLegacyDialogRef as MatDialogRef,
// } from '@angular/material/legacy-dialog';
// import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
// import { Lobby, LobbyType } from '@app/services/lobby/lobby.service.constants';
// import { Card } from '@common/card';
// import { ViewLobbyPlayersComponent } from './view-lobby-players.component';

// describe('ViewLobbyPlayersComponent', () => {
//     let component: ViewLobbyPlayersComponent;
//     let fixture: ComponentFixture<ViewLobbyPlayersComponent>;

//     beforeEach(async () => {
//         const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
//         await TestBed.configureTestingModule({
//             declarations: [ViewLobbyPlayersComponent],
//             imports: [MatDialogModule, HttpClientModule, ],
//             providers: [
//                 {
//                     provide: MatDialogRef,
//                     useValue: mockDialogRef,
//                 },
//                 {
//                     provide: MAT_DIALOG_DATA,
//                     useValue: {},
//                 },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(ViewLobbyPlayersComponent);
//         component = fixture.componentInstance;
//         component.data = { card: { id: 'hey' } as Card, players: [], lobbyNumber: 'hey1', gameMode: {} as FirstGameMode, index: 11 };
//         component['lobbyService'].playersLobby = new Map<string, Map<string, Lobby>>();
//         component['lobbyService'].playersLobby.set('hey', new Map<string, Lobby>());
//         component['lobbyService'].playersLobby.get('hey')?.set('hey1', { players: ['dd', 'dd'], lobbyType: LobbyType.PUBLIC });
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
