import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    apiUrl: string = environment.backendApiUrl;

    constructor(private http: HttpClient) { }

    login(username: string, password: string): void {
        const url = `${this.apiUrl}/auth/login`;
        this.http.post(url, {
            username: username,
            password: password
        }, { withCredentials: true }).subscribe({ next: (resp) => console.log("Login:", resp), 
        error: (err) => {
            if (err.status === 401) 
                console.log("error no auth");
            console.log(err);
        }    
        });
    }

    logout(): void {
        const url = `${this.apiUrl}/auth/logout`;
        this.http.delete(url, { withCredentials: true })
            .subscribe((resp) => console.log("Logout:", resp));
    }

    isAuth(): void {
        const url = `${this.apiUrl}/auth/test`;
        this.http.get(url, { withCredentials: true })
            .subscribe((resp) => console.log("Auth:", resp));
    }
}
