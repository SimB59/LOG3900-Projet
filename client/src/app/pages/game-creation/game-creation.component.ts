import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
/* eslint-disable */
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CardCreationComponent } from '@app/components/card-creation/card-creation.component';
import { CardDrawingComponent } from '@app/components/card-drawing/card-drawing.component';
import { CIRCLE_TOOL_FUNCTION, RECTANGLE_TOOL_FUNCTION } from '@app/components/card-drawing/card-drawing.component.constants';
import { CardsValidationComponent } from '@app/components/cards-validation/cards-validation.component';
import { GameLoadingComponent } from '@app/components/game-loading/game-loading.component';
import { DrawingToolsService } from '@app/services/drawing-tools/drawing-tools.service';
import { ImageService } from '@app/services/image/image.service';
import { SubmissionService } from '@app/services/submission/submission.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { TranslateService } from '@app/services/translate/translate.service';
import { UNNECESSARY_VALUE_BASE64 } from './game-creation.component.constants';

@Component({
    selector: 'app-game-creation',
    templateUrl: './game-creation.component.html',
    styleUrls: ['./game-creation.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class GameCreationComponent implements AfterViewInit {

    @ViewChild('originalCard') originalCard: CardCreationComponent;
    @ViewChild('modifiedCard') modifiedCard: CardCreationComponent;
    @ViewChild('originalDrawing') originalDrawing: CardDrawingComponent;
    @ViewChild('modifiedDrawing') modifiedDrawing: CardDrawingComponent;
    @ViewChild('enlargementRadius') enlargementRadius: ElementRef<HTMLSelectElement>;

    errorMessage: string;
    image: HTMLImageElement;
    original: string;
    modified: string;

    // Disable lint because this is main page and require all other services
    // eslint-disable-next-line max-params
    constructor(
        public imageService: ImageService,
        public translateService: TranslateService,
        protected drawingService: DrawingToolsService,
        private dialog: MatDialog,
        private submissionService: SubmissionService,
        protected themeService: ThemeService,
    ) {
        this.original = 'original';
        this.modified = 'modified';
    }

    ngAfterViewInit() {
        this.drawingService.contextCanvasOriginal = this.originalDrawing.context;
        this.drawingService.contextCanvasModified = this.modifiedDrawing.context;
    }

    async sendImageToChildren(target: EventTarget | null) {
        const input = target as HTMLInputElement;
        const backgroundImage = this.imageService.showPreview(input);

        if ((await backgroundImage) && !(await backgroundImage).message) {
            this.image = (await backgroundImage).image;
            this.errorMessage = (await backgroundImage).message;
        } else {
            this.errorMessage = (await backgroundImage).message;
        }

        input.value = '';
    }

    async submit() {
        this.dialog.open(GameLoadingComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
        const submitCanvasOriginal = this.submissionService.mergeImageAndDrawing(
            this.originalCard.canvas,
            this.originalDrawing.canvas,
            this.originalDrawing.hasDrawing(),
        );
        const submitCanvasModified = this.submissionService.mergeImageAndDrawing(
            this.modifiedCard.canvas,
            this.modifiedDrawing.canvas,
            this.modifiedDrawing.hasDrawing(),
        );
        await this.submissionService.differencesImage(
            this.toBase64(submitCanvasOriginal),
            this.toBase64(submitCanvasModified),
            +this.enlargementRadius.nativeElement.value,
        );
        this.openDialog();
    }

    drawingVerification() {
        //Don't delete please -- Sidney
        // if (window.getSelection) {
        //     const selections = window.getSelection() as Selection;
        //     selections.removeAllRanges();
            
        // }
        this.originalDrawing.deactivate();
        this.modifiedDrawing.deactivate();
    }

    detectMouse(event: MouseEvent) {
        const isCircleOrRectangle = this.drawingService.tool === CIRCLE_TOOL_FUNCTION || this.drawingService.tool === RECTANGLE_TOOL_FUNCTION;
        
       if(this.drawingService.getNameLastAction() === 'original' && this.originalDrawing.getIsPainting()
         && isCircleOrRectangle) {
            //call activate and give new mouse position but limit the draw to the canvas border
            this.originalDrawing.drawFromOutsideCanvas(event);
       }else if(this.drawingService.getNameLastAction() === 'modified' && this.modifiedDrawing.getIsPainting()
         && isCircleOrRectangle) {
            //call activate and give new mouse position but limit the draw to the canvas border
            this.modifiedDrawing.drawFromOutsideCanvas(event);
       }
    }

    private openDialog() {
        if (this.submissionService.cardIO.firstImage) {
            this.dialog.open(CardsValidationComponent, {
                panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
            });
        }
    }

    private toBase64(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL('image/bmp').slice(UNNECESSARY_VALUE_BASE64);
    }
}
