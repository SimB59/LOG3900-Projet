/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { PlayerInvitesComponent } from './player-invites.component';

describe('PlayerInvitesComponent', () => {
    let component: PlayerInvitesComponent;
    let fixture: ComponentFixture<PlayerInvitesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerInvitesComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerInvitesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
