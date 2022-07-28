import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, from } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

    form: FormGroup = this.fb.group({
        username: [ "", [Validators.required, Validators.minLength(3)] ],
        password: [ "", [Validators.required, Validators.minLength(6), Validators.maxLength(12)] ]
    });

    busy: boolean = false;

    constructor(private fb: FormBuilder,
                private authService: AuthService,
                private router: Router) { }

    login(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.busy = true;

        const { username, password } = this.form.value;

        this.authService.login(username, password)
            .subscribe({
                next: (resp) => {
                    this.busy = false;
                    if (resp.ok) {
                        this.router.navigateByUrl("/home");
                    }
                    else 
                        Swal.fire("Error", "Error", "error");
                },
                error: (err) => {
                    this.busy = false;
                    if (err.status === 400 || err.status === 401)
                        Swal.fire("Error", "Username or password invalid", "error");
                    else 
                        Swal.fire("Error", "Error", "error");
                }
            });
    }

    togglePasswordVisibility(input: HTMLInputElement): void {
        const inputType: string = input.type;
        input.setAttribute("type", inputType === "password" ? "text" : "password"); 
    }

    isFieldValid(controlName: string) {
        const control = this.form.get(controlName);
        return control && control?.touched && control.errors
    }


}
