import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    constructor(private readonly http: HttpClient) {}

    getRequest(route: string): Observable<Message> {
        return this.http.get<Message>(`${environment.serverUrlApi}/${route}`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    getAvatarImage(route: string): Observable<Blob> {
        return this.http.get(`${environment.serverUrlApi}/${route}`, { responseType: 'blob' });
    }

    postRequest(route: string, message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${environment.serverUrlApi}/${route}`, message, { observe: 'response', responseType: 'text' });
    }

    deleteRequest(route: string): Observable<Message> {
        return this.http.delete<Message>(`${environment.serverUrlApi}/${route}`).pipe(catchError(this.handleError<Message>('failedDelete')));
    }

    // eslint-disable-next-line
    post(route: string, body: any): Observable<HttpResponse<string>> {
        return this.http.post(`${environment.serverUrlApi}/${route}`, body, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
