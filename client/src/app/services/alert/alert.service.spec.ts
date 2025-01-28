/* eslint-disable import/no-deprecated */
/* eslint-disable deprecation/deprecation */
import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { AlertService } from '@app/services/alert/alert.service';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, NoopAnimationsModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        service = TestBed.inject(AlertService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
