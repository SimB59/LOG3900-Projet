/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameLoadingComponent } from '@app/components/game-loading/game-loading.component';

describe('LoadingComponent', () => {
    let component: GameLoadingComponent;
    let fixture: ComponentFixture<GameLoadingComponent>;
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameLoadingComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
            schemas: [NO_ERRORS_SCHEMA],
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

        fixture = TestBed.createComponent(GameLoadingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('if finishLoading is true, dialog should call close', () => {
        component['submissionService']['finishedLoadingSubject'].next(true);
        expect(mockDialogRef.close).toHaveBeenCalled();
    });
});
