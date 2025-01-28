/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { PopupMessageComponent } from './popup-message.component';

describe('PopupMessageComponent', () => {
    let component: PopupMessageComponent;
    let fixture: ComponentFixture<PopupMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PopupMessageComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { message: 'For testing purposes only', isTypeError: true },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(PopupMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
