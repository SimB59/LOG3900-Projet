// /* eslint-disable deprecation/deprecation */
// /* eslint-disable import/no-deprecated */
// import { HttpClientModule } from '@angular/common/http';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import {
//     MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
//     MatLegacyDialogModule as MatDialogModule,
//     MatLegacyDialogRef as MatDialogRef,
// } from '@angular/material/legacy-dialog';
// import { GameConstantsLobbyComponent } from './game-constants-lobby.component';

// describe('GameConstantsLobbyComponent', () => {
//     let component: GameConstantsLobbyComponent;
//     let fixture: ComponentFixture<GameConstantsLobbyComponent>;

//     beforeEach(async () => {
//         const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
//         await TestBed.configureTestingModule({
//             declarations: [GameConstantsLobbyComponent],
//             imports: [MatDialogModule, HttpClientModule],
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

//         fixture = TestBed.createComponent(GameConstantsLobbyComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
