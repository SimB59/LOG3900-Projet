import { AvatarImage } from '@app/interfaces/avatar-image';
import { Language } from '@app/interfaces/language';
import { PlayerHistory } from '@app/interfaces/player-history';
import { Theme } from '@app/interfaces/theme';
import { AccountStats } from '@app/interfaces/user-stats';

export interface AccountData {
    email: string;
    accountId: string;
    pseudo: string;
    password: string;
    avatarPicture: AvatarImage;
    accountStats: AccountStats;
    accountHistory: PlayerHistory[];
    accountLevel: number;
    accountRank: number;
    currency: number;
    socketId: string;
    language: Language;
    theme: Theme;
}
