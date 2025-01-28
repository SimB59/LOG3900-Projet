import { Injectable } from '@angular/core';
import { Language } from '@app/interfaces/language';
import { DEFAULT_LANGUAGE } from '@app/services/translate/translate.service.constants';
import { BehaviorSubject, Observable } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const translate = require('@common/translations/translate.json');
@Injectable({
    providedIn: 'root',
})
export class TranslateService {
    isEnglishObservable: Observable<boolean>;
    private isEnglishSubject: BehaviorSubject<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private translator: any;
    private language: Language;

    constructor() {
        this.translator = translate;
        this.language = DEFAULT_LANGUAGE;
        this.isEnglishSubject = new BehaviorSubject<boolean>(true); // Needs to be false if the default language is French
        this.isEnglishObservable = this.isEnglishSubject.asObservable();
    }

    get currentLanguage(): Language {
        return this.language;
    }

    setLanguage(language: Language) {
        if (language !== undefined) {
            this.language = language;
            this.isEnglishSubject.next(this.isEnglishLanguage());
        }
    }

    getTranslation(text: string): string {
        return this.translator[text][this.language];
    }

    toggleLanguage() {
        const newLanguage = this.language === Language.EN ? Language.FR : Language.EN;
        this.setLanguage(newLanguage);
    }

    private isEnglishLanguage(): boolean {
        return this.language === Language.EN;
    }
}
