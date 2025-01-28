/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component, OnDestroy } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { SubmissionService } from '@app/services/submission/submission.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-loading',
    templateUrl: './game-loading.component.html',
    styleUrls: ['./game-loading.component.scss'],
})
export class GameLoadingComponent implements OnDestroy {
    private subscriber: Subscription;
    constructor(private submissionService: SubmissionService, private dialogRef: MatDialogRef<GameLoadingComponent>) {
        this.dialogRef.disableClose = true;
        this.subscriber = this.submissionService.finishedLoadingSubject.subscribe((finishedLoading: boolean) => {
            if (finishedLoading) {
                this.dialogRef.close();
            }
        });
    }

    ngOnDestroy(): void {
        this.subscriber.unsubscribe();
    }
}
