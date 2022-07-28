import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, switchMap, of, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

export type AuthResponse = {
    ok: boolean;
    msg: string;
    username?: string;
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    apiUrl: string = environment.backendApiUrl;
    private _username: string = "";

    get username(): string {
        return this._username;
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
                if (resp.ok && resp.username)
                    this._username = resp.username;
                else
                    this._username = "";
            })
        );
    }

    logout(): Observable<AuthResponse> {
        const url = `${this.apiUrl}/api/auth/`;
        return this.http.delete<AuthResponse>(url, { withCredentials: true })
            .pipe(
                tap((_) => this._username = "")
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
                if (resp.ok && resp.username)
                    this._username = resp.username;
                else
                    this._username = "";
            })
        );
    }

    isAuthenticated(): Observable<boolean> {
        const url = `${this.apiUrl}/api/auth/`;
        return this.http.get<AuthResponse>(url, { withCredentials: true })
            .pipe(
                switchMap((resp) => {
                    if (resp.ok && resp.username) 
                        this._username = resp.username
                    else
                        this._username = "";
                    return of(resp.ok);
                }),
                catchError((err) => {
                    this._username = "";
                    return of(false);
                })
            );
    }

    isUsernameValid(username: string): Observable<AuthResponse> {
        const url = `${this.apiUrl}/api/auth/verify/${username}`;
        return this.http.get<AuthResponse>(url, { withCredentials: true });
    }
}
