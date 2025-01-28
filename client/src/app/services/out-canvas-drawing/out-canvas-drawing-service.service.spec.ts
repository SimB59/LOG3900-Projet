import { TestBed } from '@angular/core/testing';

import { OutCanvasDrawingServiceService } from './out-canvas-drawing-service.service';

describe('OutCanvasDrawingServiceService', () => {
    let service: OutCanvasDrawingServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OutCanvasDrawingServiceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
