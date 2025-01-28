/* eslint-disable */
import { Test } from "@nestjs/testing";
import { SinonStubbedInstance, createStubInstance } from "sinon";
import { DatabaseService } from "../database/database.service";
import { FriendService } from "./friends.service";

describe('FriendService', () => {
    let service: FriendService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;
    
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [],
        }).compile();
        databaseServiceStub = createStubInstance(DatabaseService);
        service = new FriendService(databaseServiceStub);
    });;

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
