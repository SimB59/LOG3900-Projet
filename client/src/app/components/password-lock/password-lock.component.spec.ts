/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordLockComponent } from './password-lock.component';

describe('PasswordLockComponent', () => {
    let component: PasswordLockComponent;
    let fixture: ComponentFixture<PasswordLockComponent>;

    beforeEach(async () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            declarations: [PasswordLockComponent],
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PasswordLockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
