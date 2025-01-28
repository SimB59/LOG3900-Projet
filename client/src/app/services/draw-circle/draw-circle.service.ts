import { Injectable } from '@angular/core';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { DrawCommands } from '@app/interfaces/draw-commands';

@Injectable({
    providedIn: 'root',
})
export class DrawCircleService {
    drawEllipseHistory(command: DrawCommands, context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.globalCompositeOperation = 'source-over';

        if (!command.color) {
            context.fillStyle = 'black';
        }
        context.fillStyle = command.color;

        const startX = command.mouseStartPositionX;
        const startY = command.mouseStartPositionY;
        const endX = command.mousePositionX;
        const endY = command.mousePositionY;
        const ellipseWidth = Math.abs(command.mousePositionX - command.mouseStartPositionX);
        const ellipseHeight = Math.abs(command.mousePositionY - command.mouseStartPositionY);
        const centerX = startX < endX ? startX + ellipseWidth / 2 : startX - ellipseWidth / 2;
        const centerY = startY < endY ? startY + ellipseHeight / 2 : startY - ellipseHeight / 2;

        const cartesianCoordinate = {
            previousPosition: { x: command.mouseStartPositionX, y: command.mouseStartPositionY },
            currentPosition: { x: command.mousePositionX, y: command.mousePositionY },
        } as CartesianCoordinate;

        if (command.isCircle) {
            this.drawCircle(context, cartesianCoordinate);
        } else {
            context.beginPath();
            context.ellipse(centerX, centerY, ellipseWidth / 2, ellipseHeight / 2, Math.PI, 0, 2 * Math.PI);
            context.fill();
        }
        return context;
    }

    drawEllipse(context: CanvasRenderingContext2D, cartesianCoordinate: CartesianCoordinate, isShiftKeyPressed: boolean): CanvasRenderingContext2D {
        const startX = cartesianCoordinate.previousPosition.x;
        const startY = cartesianCoordinate.previousPosition.y;
        const endX = cartesianCoordinate.currentPosition.x;
        const endY = cartesianCoordinate.currentPosition.y;
        const ellipseWidth = Math.abs(cartesianCoordinate.currentPosition.x - cartesianCoordinate.previousPosition.x);
        const ellipseHeight = Math.abs(cartesianCoordinate.currentPosition.y - cartesianCoordinate.previousPosition.y);
        const centerX = startX < endX ? startX + ellipseWidth / 2 : startX - ellipseWidth / 2;
        const centerY = startY < endY ? startY + ellipseHeight / 2 : startY - ellipseHeight / 2;

        if (isShiftKeyPressed) {
            // draw circle

            this.drawCircle(context, cartesianCoordinate);
        } else {
            context.beginPath();
            context.ellipse(centerX, centerY, ellipseWidth / 2, ellipseHeight / 2, 0, 0, 2 * Math.PI);

            context.fill();
        }

        return context;
    }

    drawCircle(context: CanvasRenderingContext2D, cartesianCoordinate: CartesianCoordinate): CanvasRenderingContext2D {
        const startX = cartesianCoordinate.previousPosition.x;
        const startY = cartesianCoordinate.previousPosition.y;
        const endX = cartesianCoordinate.currentPosition.x;
        const endY = cartesianCoordinate.currentPosition.y;
        let ellipseWidth = Math.abs(cartesianCoordinate.currentPosition.x - cartesianCoordinate.previousPosition.x);
        const ellipseHeight = Math.abs(cartesianCoordinate.currentPosition.y - cartesianCoordinate.previousPosition.y);
        const centerX = startX < endX ? startX + ellipseWidth / 2 : startX - ellipseWidth / 2;
        const centerY = startY < endY ? startY + ellipseHeight / 2 : startY - ellipseHeight / 2;

        if (ellipseWidth < ellipseHeight) {
            ellipseWidth = ellipseHeight;
        }
        context.beginPath();
        // context.arc(centerX, centerY, ellipseWidth / 2, 0, 2 * Math.PI);
        context.ellipse(centerX, centerY, ellipseWidth / 2, ellipseWidth / 2, 0, 0, 2 * Math.PI);

        context.fill();
        return context;
    }
}
