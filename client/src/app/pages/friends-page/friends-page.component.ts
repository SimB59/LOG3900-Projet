/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { AvatarComponent } from '@app/components/avatar/avatar.component';
import { PlayerInvitesComponent } from '@app/components/player-invites/player-invites.component';
import { DARK_DIALOG_CLASS, DEFAULT_DIALOG_CLASS } from '@app/services/theme/theme.service.constants';
import { BlockPlayerComponent } from '@app/components/block-player/block-player.component';
import { Friend } from '@common/friend';

@Component({
    selector: 'app-friends-page',
    templateUrl: './friends-page.component.html',
    styleUrls: ['./friends-page.component.scss'],
})
export class FriendsPageComponent implements OnDestroy, OnInit {
    @ViewChild('avatar') avatarComponent: AvatarComponent;
    protected searchedName = '';

    // eslint-disable-next-line max-params
    constructor(
        protected accountService: AccountService,
        private router: Router,
        protected translateService: TranslateService,
        protected dialog: MatDialog,
        protected themeService: ThemeService,
    ) {}

    ngOnInit(): void {
        // Show all accounts in the database
        this.accountService.searchPlayer(this.searchedName);
    }

    ngOnDestroy(): void {
        this.accountService.searchedPlayers = [];
    }

    protected async disconnect(): Promise<void> {
        const success = await this.accountService.disconnectAccount();
        if (success) {
            // Redirect to the main page
            this.router.navigate(['/home']);
        }
    }

    protected aUserIsConnected(): boolean {
        return this.accountService.aUserIsConnected();
    }

    protected isAccountPendingFriendRequestApproval(accountId: string): boolean {
        // Prevents the user from sending a friend request to a user that already has a pending request
        const sentRequestIds = this.accountService.sentRequests.map((request) => request.accountId);
        return sentRequestIds.includes(accountId);
    }

    protected isPlayerInFriendList(accountId: string): boolean {
        return this.accountService.friendsList.some((friend) => friend.accountId === accountId);
    }

    protected isPlayerInBlockedList(accountId: string): boolean {
        return this.accountService.blockedList.some((blocked) => blocked.accountId === accountId);
    }

    protected openInvitesDialog(): void {
        this.dialog.open(PlayerInvitesComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
        });
    }

    protected openBlockDialog(player: Friend): void {
        this.dialog.open(BlockPlayerComponent, {
            panelClass: this.themeService.isDarkTheme() ? [DEFAULT_DIALOG_CLASS, DARK_DIALOG_CLASS] : DEFAULT_DIALOG_CLASS,
            data: { player },
        });
    }
}
