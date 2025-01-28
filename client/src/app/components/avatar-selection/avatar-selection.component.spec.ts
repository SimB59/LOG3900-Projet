/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import {
    MatLegacyDialogModule as MatDialogModule,
    MatLegacyDialogRef as MatDialogRef,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarSelectionComponent } from './avatar-selection.component';
import { HttpClientModule } from '@angular/common/http';

describe('AvatarSelectionComponent', () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    let component: AvatarSelectionComponent;
    let fixture: ComponentFixture<AvatarSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AvatarSelectionComponent],
            imports: [MatDialogModule, HttpClientModule],
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

        fixture = TestBed.createComponent(AvatarSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
