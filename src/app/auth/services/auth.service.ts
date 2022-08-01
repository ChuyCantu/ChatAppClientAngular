import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, switchMap, of, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { User } from 'src/app/chat/interfaces/chat-events';

export type AuthResponse = {
    ok: boolean;
    msg: string;
    user?: User;
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    apiUrl: string = environment.backendApiUrl;
    private _user: User = { id: -1, username: "" };

    get user(): User {
        return { ...this._user };
    }

    get username(): string {
        return this._user.username;
    }

    get userId(): number {
        return this._user.id;
    }

    constructor(private http: HttpClient) { }

    login(username: string, password: string): Observable<AuthResponse> {
        const url = `${this.apiUrl}/api/auth/`;
        return this.http.post<AuthResponse>(url, {
            username,
            password
        }, { 
            withCredentials: true 
        }).pipe(
            tap((resp) => {
                if (resp.ok && resp.user)
                    this._user = resp.user;
                else
                    this._user = { id: -1, username: "" };
            })
        );
    }

    logout(): Observable<AuthResponse> {
        const url = `${this.apiUrl}/api/auth/`;
        return this.http.delete<AuthResponse>(url, { withCredentials: true })
            .pipe(
                tap((_) => this._user = { id: -1, username: "" })
            );
    }

    signup(username: string, password: string, confirm_password: string): Observable<AuthResponse> {
        const url = `${this.apiUrl}/api/auth/new`;
        return this.http.post<AuthResponse>(url, {
            username,
            password,
            confirm_password
        }, {
            withCredentials: true
        }).pipe(
            tap((resp) => {
                if (resp.ok && resp.user)
                    this._user = resp.user;
                else
                    this._user = { id: -1, username: "" };
            })
        );
    }

    isAuthenticated(): Observable<boolean> {
        const url = `${this.apiUrl}/api/auth/`;
        return this.http.get<AuthResponse>(url, { withCredentials: true })
            .pipe(
                switchMap((resp) => {
                    if (resp.ok && resp.user) 
                        this._user = resp.user
                    else
                        this._user = { id: -1, username: "" };
                    return of(resp.ok);
                }),
                catchError((err) => {
                    this._user = { id: -1, username: "" };
                    return of(false);
                })
            );
    }

    isUsernameValid(username: string): Observable<boolean> {
        const url = `${this.apiUrl}/api/auth/verify/${username}`;
        return this.http.get<AuthResponse>(url, { withCredentials: true })
            .pipe(
                switchMap((resp) => {
                    return of(resp.ok);
                }),
                catchError((err) => of(false))
            );
    }
}
