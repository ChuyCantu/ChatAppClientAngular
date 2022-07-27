import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

    constructor(private fb: FormBuilder) { }

    register(): void {
        console.log(this.form.value);
    }

    togglePasswordVisibility(input: HTMLInputElement): void {
        const inputType: string = input.type;
        input.setAttribute("type", inputType === "password" ? "text" : "password");
    }
}
