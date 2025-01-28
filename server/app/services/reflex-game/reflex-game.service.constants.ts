import { Player } from '@app/services/game-manager/game-manager.service.constants';
import { Coordinate } from '@common/coordinates';

export interface ReflexInitData {
    players: Player[];
    initialDifferences: Coordinate[][];
}
