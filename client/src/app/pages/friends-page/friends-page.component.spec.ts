/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendsPageComponent } from './friends-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

describe('FriendsPageComponent', () => {
    let component: FriendsPageComponent;
    let fixture: ComponentFixture<FriendsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FriendsPageComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(FriendsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
