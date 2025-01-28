import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionAreaComponent } from '@app/components/selection-area/selection-area.component';
import { ViewMode } from '@app/components/selection-area/selection-area.component.constants';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    @ViewChild('selectionArea') selectionArea: SelectionAreaComponent;
    protected viewMode: ViewMode;

    constructor(
        protected themeService: ThemeService,
        protected cardChangeService: CardSelectionChangeService,
        public translationService: TranslateService,
    ) {
        this.viewMode = ViewMode.CLASSIC;
    }

    async ngOnInit() {
        await this.cardChangeService.fetchCards();
        await this.cardChangeService.fetchActiveCards();
    }
}
