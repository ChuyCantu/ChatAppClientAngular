import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

    get username(): string {
        return this.authService.username;
    }

    constructor(private authService: AuthService,
                private router: Router) { }

    ngOnInit(): void {
    }

    logout(): void {
        this.authService.logout()
            .subscribe((resp) => this.router.navigateByUrl("/auth/login"));
    }

}
