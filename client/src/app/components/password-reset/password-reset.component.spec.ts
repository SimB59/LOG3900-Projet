/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogModule as MatDialogModule,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';

import { HttpClientModule } from '@angular/common/http';
import { PasswordResetComponent } from './password-reset.component';

describe('PasswordResetComponent', () => {
    let component: PasswordResetComponent;
    let fixture: ComponentFixture<PasswordResetComponent>;

    beforeEach(async () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            declarations: [PasswordResetComponent],
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

        fixture = TestBed.createComponent(PasswordResetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
