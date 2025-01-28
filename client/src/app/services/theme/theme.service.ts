import { Injectable } from '@angular/core';
import { DEFAULT_THEME, Theme } from '@app/interfaces/theme';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    isDarkObservable: Observable<boolean>;
    private isDarkSubject: BehaviorSubject<boolean>;
    private theme: Theme;

    constructor() {
        this.theme = DEFAULT_THEME;
        this.isDarkSubject = new BehaviorSubject<boolean>(false);
        this.isDarkObservable = this.isDarkSubject.asObservable();
    }

    get currentTheme(): Theme {
        return this.theme;
    }

    setTheme(theme: Theme) {
        if (theme !== undefined) {
            this.theme = theme;
            this.isDarkSubject.next(this.isDarkTheme());
            this.adjustDialogTheme();
        }
    }

    toggleTheme() {
        const newTheme = this.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        this.setTheme(newTheme);
    }

    isDarkTheme(): boolean {
        return this.theme === Theme.DARK;
    }

    private adjustDialogTheme() {
        const dialogElements = document.getElementsByClassName(DEFAULT_DIALOG_CLASS);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < dialogElements.length; i++) {
            if (this.isDarkTheme()) {
                dialogElements[i].classList.add(DARK_DIALOG_CLASS);
            } else {
                dialogElements[i].classList.remove(DARK_DIALOG_CLASS);
            }
        }
    }
}
