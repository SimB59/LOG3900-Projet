import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { Language } from '@app/interfaces/language';
import { Subscription } from 'rxjs';
import { Theme } from '@app/interfaces/theme';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent implements OnInit, OnDestroy {
    @Input() preference: Language | Theme = Language.FR; // If Input is not provided, the default toggle will be a Language toggle
    protected isChecked: boolean; // name needs to be isChecked since it is a property in the template
    protected isLanguageToggle: boolean;
    private subscription: Subscription;
    constructor(protected translateService: TranslateService, protected themeService: ThemeService, protected accountService: AccountService) {}

    ngOnInit() {
        this.isLanguageToggle = this.preference === Language.EN || this.preference === Language.FR;
        if (this.isLanguageToggle) {
            // The toggle is to toggle the language
            this.subscription = this.translateService.isEnglishObservable.subscribe((isEnglish) => {
                this.isChecked = isEnglish;
            });
        } else {
            // Then the toggle is to toggle the theme
            this.subscription = this.themeService.isDarkObservable.subscribe((isDark) => {
                this.isChecked = isDark;
            });
        }
    }

    ngOnDestroy() {
        // Always unsubscribe on component destruction to prevent memory leaks
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected onClick(): void {
        if (this.isLanguageToggle) {
            // The toggle is to toggle the language
            this.translateService.toggleLanguage();
        } else {
            // Then the toggle is to toggle the theme
            this.themeService.toggleTheme();
        }
        if (this.accountService.aUserIsConnected()) this.accountService.updatePreferences();
    }
}
