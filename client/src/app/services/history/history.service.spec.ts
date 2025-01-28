/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HistoryService } from '@app/services/history/history.service';

describe('HistoryService', () => {
    let service: HistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(HistoryService);

    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    /* it('deleteHistory should call delete request with correct route and empty service.history', async () => {
        const responseMessage = { title: 'title', body: 'test' };
        const spy = spyOn(httpService, 'deleteRequest').and.returnValue(of(responseMessage));
        await service.deleteHistory();
        expect(spy).toHaveBeenCalledWith('card/history');
        expect(service['history']).toEqual([]);
    });

    it('loadHistory should call get request with correct route and fill service.history', async () => {
        const responseMessage = { title: 'title', body: JSON.stringify(fakeHistory) };
        const spy = spyOn(httpService, 'getRequest').and.returnValue(of(responseMessage));
        await service['loadHistory']();
        expect(spy).toHaveBeenCalledWith('card/history');
        expect(service['history']).toEqual(JSON.parse(responseMessage.body));
    });

    it('handleHistoryChanged should shift gameHistory in service.history', () => {
        spyOn<any>(socketService, "send").and.callFake(()=>{});
        service['history'] = [fakeHistorySecond, fakeHistoryThird];
        const expectedArray = [fakeHistory, fakeHistorySecond, fakeHistoryThird];
        service['handleHistoryChanged'](fakeHistory);
        expect(service['history']).toEqual(expectedArray);
    });

    it('handleSocket should call socketService.addCallbackToMessage with correct parameters', () => {
        socketHelper.peerSideEmit("historyChanged", JSON.stringify(fakeHistory));
        socketHelper.peerSideEmit("resetHistory");
        expect(service['history']).toEqual([]);
    }); */
});
