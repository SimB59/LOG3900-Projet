import { Injectable } from '@angular/core';
import { MouseService } from '@app/services/mouse/mouse.service';
import { Coordinate } from '@common/coordinates';
import { X_MIN_VALUE, Y_MIN_VALUE } from './out-canvas-drawing.service.constants';

@Injectable({
    providedIn: 'root',
})
export class OutCanvasDrawingServiceService {
    constructor(private mouseService: MouseService) {}

    getPosition(event: MouseEvent, canvas: HTMLCanvasElement): Coordinate {
        const position = this.mouseService.getMousePositionOnScreen(event);

        position.x = position.x - canvas.getBoundingClientRect().left;
        position.y = position.y - canvas.getBoundingClientRect().top;
        position.x = position.x < X_MIN_VALUE ? X_MIN_VALUE : position.x;
        position.x = position.x > canvas.width ? canvas.width : position.x;
        position.y = position.y < Y_MIN_VALUE ? Y_MIN_VALUE : position.y;
        position.y = position.y > canvas.height ? canvas.height : position.y;

        return position as Coordinate;
    }
}
