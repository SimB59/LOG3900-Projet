/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatLegacyDialogModule } from '@angular/material/legacy-dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { VideoReplayComponent } from './video-replay.component';

describe('VideoReplayComponent', () => {
    let component: VideoReplayComponent;
    let fixture: ComponentFixture<VideoReplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoReplayComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [MatLegacyDialogModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoReplayComponent);
        component = fixture.componentInstance;

        component.videoReplay = {
            videoId: 'testVideoId',
            gameEvents: [],
            playerOpponentNames: ['Opponent1', 'Opponent2'],
            playerSharingName: 'TestPlayer',
            cardId: 'testCardId',
            constants: { initial: 30, gain: 5, penalty: 5, isCheatMode: false },
            isPublic: true,
            date: '01/01/2024',
            accountId: 'testAccountId',
            cardName: 'testCardName',
            pseudo: 'testPseudo',
            shouldDisplay: true,
        };
        component.isOwner = true;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
