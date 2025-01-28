import { Component } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    isChatboxHidden = false;
    showHideButton = true;
    constructor(private accountService: AccountService, protected translateService: TranslateService) {}

    toggleChatboxVisibility() {
        this.isChatboxHidden = !this.isChatboxHidden;
    }

    isChatDetach(isAttached: boolean) {
        this.showHideButton = isAttached;
    }

    protected aUserIsConnected(): boolean {
        return this.accountService.aUserIsConnected();
    }
}
