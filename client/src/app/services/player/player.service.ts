/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { AccountService } from '@app/services/account/account.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    opponentPlayers: Player[];
    private self: Player;
    private opponent: Player;

    // TODO change everything below, since deprecated
    constructor(public accountService: AccountService, public socketService: SocketClientService) {
        this.self = { pseudo: this.accountService.pseudo, differenceCount: 0, rank: 0 };
        this.opponent = { pseudo: 'Adversaire_Adversaire_Adversaire_Adversaire_Adversaire_', differenceCount: 0, rank: 0 };
        this.opponentPlayers = [];
        this.socketService.addCallbackToMessageAccountSocket('setRank', (data) => {
            const player = JSON.parse(data as string);
            let i = 0;
            this.opponentPlayers.forEach((players) => {
                if (players.pseudo === player.pseudo) this.opponentPlayers[i].rank = this.opponentPlayers[i].rank > 2 ? 3 : player.rank;
                i++;
            });
        });
    }

    get selfName() {
        return this.self.pseudo;
    }

    get opponentName() {
        return this.opponent.pseudo;
    }

    get selfDiffCount() {
        return this.self.differenceCount;
    }

    get opponentDiffCount() {
        return this.opponent.differenceCount;
    }

    set setSelfName(name: string) {
        this.self.pseudo = name;
    }

    setOpponentPlayer(data: string, isObserver: boolean = false) {
        this.clearPlayers();
        const players = JSON.parse(data as string);
        if (isObserver) {
            players.forEach((player: string) => {
                this.opponentPlayers.push({ pseudo: player, differenceCount: 0, rank: 0 });
                this.socketService.sendAccountInfo('getRank', player);
            });
        } else {
            players.forEach((player: { pseudo: string }) => {
                if (player.pseudo !== this.accountService.pseudo) {
                    this.opponentPlayers.push({ pseudo: player.pseudo, differenceCount: 0, rank: 0 });
                    this.socketService.sendAccountInfo('getRank', player.pseudo);
                }
            });
        }
    }

    clearPlayers() {
        this.self.differenceCount = 0;
        this.opponentPlayers = [];
    }

    incrementPlayerDiffCount(pseudo: string, isObserver: boolean) {
        if (isObserver) {
            this.opponentPlayers.forEach((player) => {
                if (player.pseudo === pseudo) player.differenceCount++;
            });
        } else {
            if (this.accountService.pseudo === pseudo) this.self.differenceCount++;
            else {
                this.opponentPlayers.forEach((player) => {
                    if (player.pseudo === pseudo) player.differenceCount++;
                });
            }
        }
    }

    incrementSelfDiffCount(isObserver: boolean) {
        if (isObserver) {
            this.opponentPlayers[0].differenceCount++;
        } else {
            this.self.differenceCount++;
        }
    }

    getPlayerDiffCount(isSelf: boolean) {
        return isSelf ? this.self.differenceCount : this.opponent.differenceCount;
    }

    resetCounter() {
        this.opponent.differenceCount = 0;
        this.self.differenceCount = 0;
        this.opponentPlayers.forEach((player) => (player.differenceCount = 0));
    }

    resetOpponentScore() {
        this.opponentPlayers.forEach((player) => (player.differenceCount = 0));
    }
}
