/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component, OnDestroy } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AccountService } from '@app/services/account/account.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-account-loading',
    templateUrl: './account-loading.component.html',
    styleUrls: ['./account-loading.component.scss'],
})
export class AccountLoadingComponent implements OnDestroy {
    private subscriber: Subscription;
    constructor(private accountService: AccountService, private dialogRef: MatDialogRef<AccountLoadingComponent>) {
        this.dialogRef.disableClose = true;
        this.subscriber = this.accountService.finishedLoadingSubject.subscribe((finishedLoading: boolean) => {
            if (finishedLoading) {
                this.dialogRef.close();
            }
        });
    }

    ngOnDestroy(): void {
        this.subscriber.unsubscribe();
    }
}
