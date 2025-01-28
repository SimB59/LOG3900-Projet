import { Language } from '@app/interfaces/language';
import { Theme } from '@app/interfaces/theme';
import { AccountStats } from '@app/interfaces/user-stats';

export interface DataBaseAccountData {
    accountId: string;
    email: string;
    pseudo: string;
    password: string;
    avatarPictureId: string;
    accountStats: AccountStats;
    accountLevel: number;
    accountRank: number;
    currency: number;
    language: Language;
    theme: Theme;
}
