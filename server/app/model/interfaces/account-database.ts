import { UserStats } from '@app/model/database/user-stats';
import { Language } from '@app/model/interfaces/language';
import { Theme } from '@app/model/interfaces/theme';

export interface AccountDatabase {
    accountId: string;
    email: string;
    pseudo: string;
    password: string;
    avatarPictureId: string;
    accountStats: UserStats;
    accountLevel: number;
    accountRank: number;
    currency: number;
    language: Language;
    theme: Theme;
}
