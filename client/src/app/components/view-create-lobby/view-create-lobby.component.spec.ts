/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogModule as MatDialogModule,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ViewCreateLobbyComponent } from './view-create-lobby.component';

describe('ViewCreateLobbyComponent', () => {
    let component: ViewCreateLobbyComponent;
    let fixture: ComponentFixture<ViewCreateLobbyComponent>;

    beforeEach(async () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            declarations: [ViewCreateLobbyComponent],
            imports: [HttpClientTestingModule, MatDialogModule, RouterTestingModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ViewCreateLobbyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
