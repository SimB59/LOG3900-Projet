/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { ProfilePageComponent } from './profile-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProfilePageComponent', () => {
    let component: ProfilePageComponent;
    let fixture: ComponentFixture<ProfilePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProfilePageComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ProfilePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
