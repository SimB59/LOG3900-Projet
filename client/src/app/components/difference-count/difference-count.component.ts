import { Component, Input } from '@angular/core';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-difference-count',
    templateUrl: './difference-count.component.html',
    styleUrls: ['./difference-count.component.scss'],
})
export class DifferenceCountComponent {
    @Input() playerName: string;
    @Input() differenceFoundNumber: number;
    @Input() rank: string;
    @Input() isLimited: boolean;

    constructor(protected themeService: ThemeService) {}
}
