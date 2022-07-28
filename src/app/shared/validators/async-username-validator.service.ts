import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, timer, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AsyncUsernameValidatorService implements AsyncValidator {

    constructor(private authService: AuthService) { }

    validate(control: AbstractControl<any, any>): Observable<ValidationErrors | null> {
        const username = control.value;

        return timer(300).pipe(
            switchMap(() => {
                return this.authService.isUsernameValid(username)
                    .pipe(
                        map((valid) => valid ? null : { usernameTaken: true })
                    );
            })
        )

        // return this.authService.isUsernameValid(username)
        //     .pipe(
        //         debounceTime(1000),
        //         distinctUntilChanged(),
        //         map((valid) => valid ? null : { usernameTaken: true }),
        //         tap(resp => console.log("user validation running..."))
        //     );
    }
}
