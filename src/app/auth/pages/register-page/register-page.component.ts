import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {

    form: FormGroup = this.fb.group({
        username: ["", [Validators.required, Validators.minLength(3)]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirm_password: ["", [Validators.required, Validators.minLength(6)]]
    });

    constructor(private fb: FormBuilder,
                private authService: AuthService,
                private router: Router) { }

    signup(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { username, password, confirm_password } = this.form.value;

        this.authService.signup(username, password, confirm_password)
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
