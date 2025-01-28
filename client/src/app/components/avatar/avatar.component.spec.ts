/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

describe('AvatarComponent', () => {
    let component: AvatarComponent;
    let fixture: ComponentFixture<AvatarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AvatarComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
