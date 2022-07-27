import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

    constructor(private fb: FormBuilder) { }

    login(): void {
        console.log(this.form.value);
    }

    togglePasswordVisibility(input: HTMLInputElement): void {
        const inputType: string = input.type;
        input.setAttribute("type", inputType === "password" ? "text" : "password"); 
    }
}
