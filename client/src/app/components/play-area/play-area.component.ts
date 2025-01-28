/* eslint-disable */
import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { DrawService } from '@app/services/draw/draw.service';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Coordinate } from '@common/coordinates';
import { environment } from 'src/environments/environment';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from './play-area.component.constants';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @Input() cardId: string;
    @ViewChild('canvasOriginal', { static: false }) private canva1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasModified', { static: false }) private canva2!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasOriginalObs', { static: false }) private canva3!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasModifiedObs', { static: false }) private canva4!: ElementRef<HTMLCanvasElement>;
    protected coolDownOver: boolean = true;
    private canvasSize;

    // eslint-disable-next-line max-params
    constructor(
        protected drawService: DrawService,
        protected router: ActivatedRoute,
        protected lobbyService: LobbyService,
        protected translationService: TranslateService,
        protected gameService: GameService,
    ) {
        this.canvasSize = { x: DEFAULT_CANVAS_WIDTH, y: DEFAULT_CANVAS_HEIGHT };
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngOnChanges() {
        this.drawImages();
    }

    ngAfterViewInit() {
        this.drawService.contextModified = this.canva1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canva1.nativeElement.focus();
        this.drawService.contextModifiedObs = this.canva4.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canva4.nativeElement.focus();
        this.drawService.contextOriginal = this.canva2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canva2.nativeElement.focus();
        this.drawService.contextOriginalObs = this.canva3.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canva3.nativeElement.focus();
        this.drawImages();
    }

    onSelectedPixels(imageData: Coordinate[], isRight: boolean) {
        this.lobbyService.sendObserverInteraction(imageData, isRight);
        this.coolDownOver = false;
        setTimeout(() => {
            this.coolDownOver = true;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 3000);
    }

    isObserverMode() {
        return this.router.snapshot.queryParams['observer'] === 'true';
    }

    private async drawImages() {
        if (this.canva1 && this.canva2 && this.lobbyService.gameService.gameData.id !== FirstGameMode.LIMITED_TIME) {
            await this.drawService.drawImage(environment.serverUrlApi + '/image/' + this.cardId + '_original', true);
            await this.drawService.drawImage(environment.serverUrlApi + '/image/' + this.cardId + '_modified', false);

            if (!this.lobbyService.gameService.isClassicMode) {
                // There is only one difference in limited time mode and we need to hide it -- 25/03/224Sidney
                this.drawService.hideDifference(this.lobbyService.gameService.gameData.differences[0]);
            }
        }
        this.lobbyService.gameService.differenceFoundPositions.forEach((diff) => {
            this.drawService.resetImages(diff);
        });
    }
}
