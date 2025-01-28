/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogModule as MatDialogModule,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { ProfileCreationComponent } from './profile-creation.component';

describe('ProfileCreationComponent', () => {
    let component: ProfileCreationComponent;
    let fixture: ComponentFixture<ProfileCreationComponent>;

    beforeEach(async () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            declarations: [ProfileCreationComponent],
            imports: [MatDialogModule, HttpClientTestingModule],
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

        fixture = TestBed.createComponent(ProfileCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
