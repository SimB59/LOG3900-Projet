import { TestBed } from '@angular/core/testing';

import { DrawCircleService } from './draw-circle.service';

describe('DrawCircleService', () => {
    let service: DrawCircleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawCircleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
