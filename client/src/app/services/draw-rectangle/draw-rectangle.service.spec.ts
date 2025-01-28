import { TestBed } from '@angular/core/testing';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';

import { RectangleService } from './draw-rectangle.service';

describe('RectangleService', () => {
    let service: RectangleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RectangleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('printSquare should have draw a square', () => {
        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const cartesianCoordinate = {
            previousPosition: { x: 1, y: 2 },
            currentPosition: { x: 1, y: 2 },
        } as CartesianCoordinate;
        context = service.printSquare(context, cartesianCoordinate);

        expect(context).toBeTruthy();
    });

    it('printRectangle should have draw a rectangle', () => {
        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const cartesianCoordinate = {
            previousPosition: { x: 1, y: 2 },
            currentPosition: { x: 1, y: 2 },
        } as CartesianCoordinate;
        context = service.printRectangle(context, cartesianCoordinate);

        expect(context).toBeTruthy();
    });
});
