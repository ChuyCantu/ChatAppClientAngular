import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { ValidatorService } from 'src/app/shared/validators/validator.service';
import { AsyncUsernameValidatorService } from 'src/app/shared/validators/async-username-validator.service';

@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {

    form: FormGroup = this.fb.group({
        username: ["", [Validators.required, Validators.minLength(3)], [this.usernameValidator]],
        password: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
        confirm_password: ["", [Validators.required, Validators.minLength(6)]]
    },
    {
        validators: [ this.validatorService.fieldsEqual("password", "confirm_password") ]
    });

    busy: boolean = false;

    constructor(private fb: FormBuilder,
                private authService: AuthService,
                private router: Router,
                private validatorService: ValidatorService,
                private usernameValidator: AsyncUsernameValidatorService) { }

    signup(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.busy = true;

        const { username, password, confirm_password } = this.form.value;

        this.authService.signup(username, password, confirm_password)
            .subscribe({
                next: (resp) => {
                    this.busy = false;
                    if (resp.ok) {
                        this.router.navigateByUrl("/home");
                    }
                    else 
                        Swal.fire("Error", resp.msg, "error");
                },
                error: (err) => {
                    this.busy = false;
                    if (err.status === 400 || err.status === 401)
                        Swal.fire("Error", "Username or password invalid", "error");
                    else 
                        Swal.fire("Error", err.error.msg, "error");
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
