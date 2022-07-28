import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, from } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

    form: FormGroup = this.fb.group({
        username: [ "", [Validators.required, Validators.minLength(3)] ],
        password: [ "", [Validators.required, Validators.minLength(6)] ]
    });

    constructor(private fb: FormBuilder,
                private authService: AuthService,
                private router: Router) { }

    login(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { username, password } = this.form.value;

        this.authService.login(username, password)
            .subscribe({
                next: (resp) => {
                    if (resp.ok) {
                        this.router.navigateByUrl("/home");
                    }
                    else 
                        console.log("Error");
                },
                error: (err) => {
                    if (err.status === 400 || err.status === 401)
                        console.log("Username or password invalid");
                    else 
                        console.log("Error");
                }
            });
    }

    togglePasswordVisibility(input: HTMLInputElement): void {
        const inputType: string = input.type;
        input.setAttribute("type", inputType === "password" ? "text" : "password"); 
    }
}
