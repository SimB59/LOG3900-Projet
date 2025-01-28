import { PlayerHistory } from '@app/model/database/player-history';
import { UserStats } from '@app/model/database/user-stats';
import { AvatarImage } from '@app/model/interfaces/avatar-image';
import { Language } from '@app/model/interfaces/language';
import { Theme } from '@app/model/interfaces/theme';

export interface AccountData {
    email: string;
    accountId: string;
    pseudo: string;
    password: string;
    avatarPicture: AvatarImage;
    accountStats: UserStats;
    accountHistory: PlayerHistory[];
    accountLevel: number;
    accountRank: number;
    currency: number;
    socketId: string;
    language: Language;
    theme: Theme;
}
