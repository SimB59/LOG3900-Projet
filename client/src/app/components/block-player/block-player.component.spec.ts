/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { BlockPlayerComponent } from './block-player.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BlockPlayerComponent', () => {
    let component: BlockPlayerComponent;
    let fixture: ComponentFixture<BlockPlayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BlockPlayerComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { player: { accountId: '1', username: 'test' } },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BlockPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
