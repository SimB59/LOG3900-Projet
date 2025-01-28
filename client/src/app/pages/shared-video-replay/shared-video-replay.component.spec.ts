/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialogModule } from '@angular/material/legacy-dialog';
import { SharedVideoReplayComponent } from './shared-video-replay.component';

describe('SharedVideoReplayComponent', () => {
    let component: SharedVideoReplayComponent;
    let fixture: ComponentFixture<SharedVideoReplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SharedVideoReplayComponent],
            imports: [HttpClientTestingModule, MatLegacyDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SharedVideoReplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
