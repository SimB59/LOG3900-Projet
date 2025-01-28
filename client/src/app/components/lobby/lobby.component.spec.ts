/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Card } from '@common/card';
import { LobbyComponent } from './lobby.component';

describe('LobbyComponent', () => {
    let component: LobbyComponent;
    let fixture: ComponentFixture<LobbyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
        
            ],
            declarations: [LobbyComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(LobbyComponent);
        component = fixture.componentInstance;
        component.card = {id: "dd"} as Card;
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /* it('should call lobbyService.abandonWaitingRoom() if lobbyService.isInLobby and not lobbyService.isGameCreator', () => {
        mockDialogRef.beforeClosed();
        expect(component['lobbyService'].abandonWaitingRoom).toHaveBeenCalled();
    }); */
});

/*describe('LobbyComponent', () => {
    let component: LobbyComponent;
    let fixture: ComponentFixture<LobbyComponent>;
    let mockDialogRef: MatDialogRef<LobbyComponent>;
    let mockLobbyService: Partial<LobbyService>;

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj(['beforeClosed']);
        mockDialogRef.beforeClosed = () => {
            return of(true);
        };
        mockLobbyService = {
            isInLobby: true,
            isGameCreator: true,
            discardCreatedGame: jasmine.createSpy('discardCreatedGame'),
            abandonWaitingRoom: jasmine.createSpy('abandonWaitingRoom'),
        };

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: LobbyService, useValue: mockLobbyService },
                { provide: MatDialogRef, useValue: mockDialogRef },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
            declarations: [LobbyComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LobbyComponent);
        component = fixture.componentInstance;
        mockLobbyService.isGameCreator = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call lobbyService.discardCreatedGame() if lobbyService.isInLobby and lobbyService.isGameCreator', () => {
        mockDialogRef.beforeClosed();
        expect(component['lobbyService'].discardCreatedGame).toHaveBeenCalled();
    });
}); */
