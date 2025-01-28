import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { Coordinate } from '@common/coordinates';

@Directive({
    selector: '[appRectangleSelect]',
})
export class RectangleSelectDirective {
    @Output() selectedPixels: EventEmitter<Coordinate[]> = new EventEmitter();

    private isDrawing: boolean = false;
    private startX: number = 0;
    private startY: number = 0;

    constructor(private el: ElementRef) {}

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.isDrawing = true;
        const rect = this.el.nativeElement.getBoundingClientRect();
        this.startX = event.clientX - rect.left;
        this.startY = event.clientY - rect.top;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (!this.isDrawing) return;
        const rect = this.el.nativeElement.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;

        // Clear previous selection
        const ctx = this.el.nativeElement.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw selection rectangle
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.startX, this.startY, endX - this.startX, endY - this.startY);
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        if (!this.isDrawing || !this.startX || !this.startY) return;
        this.isDrawing = false;

        const rect = this.el.nativeElement.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;

        const selectedCoordinates: Coordinate[] = [];

        // Iterate over the outer edge pixels of the drawn rectangle
        for (let x = this.startX; x <= endX; x++) {
            selectedCoordinates.push({ x: Math.round(x), y: Math.round(this.startY) }); // Top edge
            selectedCoordinates.push({ x: Math.round(x), y: Math.round(endY) }); // Bottom edge
        }
        for (let y = this.startY; y <= endY; y++) {
            selectedCoordinates.push({ x: Math.round(this.startX), y: Math.round(y) }); // Left edge
            selectedCoordinates.push({ x: Math.round(endX), y: Math.round(y) }); // Right edge
        }

        this.selectedPixels.emit(selectedCoordinates);
    }
}
