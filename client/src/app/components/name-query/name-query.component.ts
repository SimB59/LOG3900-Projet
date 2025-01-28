/* eslint-disable */
import { Component } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MAX_LENGTH_NAME, PLACEHOLDER_NAME } from './name-query.component.constants';

@Component({
    selector: 'app-name-query',
    templateUrl: './name-query.component.html',
    styleUrls: ['./name-query.component.scss'],
})
export class NameQueryComponent {
    protected playerName: string;
    protected placeholderName: string;
    protected readonly maxLengthName = MAX_LENGTH_NAME;

    // We need all of these parameters, so we disable the max-params rule.
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
    ) {
        this.playerName = '';
        this.placeholderName = PLACEHOLDER_NAME;
    }
}
