import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.css']
})
export class OptionsComponent {

    constructor(private authService: AuthService,
                private router: Router) { }


    logout(): void {
        this.authService.logout()
            .subscribe((resp) => this.router.navigateByUrl("/auth/login"));
    }
}
