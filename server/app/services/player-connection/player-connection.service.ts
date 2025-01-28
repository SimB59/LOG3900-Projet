import { PlayerConnection } from '@app/model/database/player-connection';
import { DatabaseService } from '@app/services/database/database.service';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

// Not currently being used as AccountService accesses to DatabaseService directly
@Injectable()
export class PlayerConnectionService {
    constructor(private readonly databaseService: DatabaseService) {}

    async removePlayerConnection(filter: FilterQuery<PlayerConnection>): Promise<void> {
        await this.databaseService.removePlayerConnection(filter);
    }
    async createPlayerConnection(filter: PlayerConnection): Promise<void> {
        await this.databaseService.createPlayerConnection(filter);
    }

    async getPlayerConnection(filter: FilterQuery<PlayerConnection>): Promise<PlayerConnection[]> {
        return await this.databaseService.findPlayerConnection(filter);
    }
}
