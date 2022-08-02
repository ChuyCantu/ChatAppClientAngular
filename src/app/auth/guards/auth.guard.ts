import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ChatSocketService } from 'src/app/chat/services/chat-socket.service';
import { ChatService } from 'src/app/chat/services/chat.service';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

    constructor(private authService: AuthService,
                private router: Router,
                private chatSocket: ChatSocketService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authService.isAuthenticated()
            .pipe(
                tap((authenticated) => {
                    if (!authenticated) {
                        this.chatSocket.disconnect();
                        this.router.navigateByUrl("/auth/login");
                    }
                    else
                        this.chatSocket.connect();
                })
            );
    }
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
        return this.authService.isAuthenticated()
            .pipe(
                tap((authenticated) => {
                    if (!authenticated) {
                        this.chatSocket.disconnect();
                        this.router.navigateByUrl("/auth/login");
                    }
                    else
                        this.chatSocket.connect();
                })
            );
    }
}
