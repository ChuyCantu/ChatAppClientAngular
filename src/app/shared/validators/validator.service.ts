import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidatorService {

    constructor() { }

    fieldsEqual(field1: string, field2: string): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const control2 = formGroup.get(field2);
            const v1 = formGroup.get(field1)?.value;
            const v2 = control2?.value;

            if (v1 !== v2) {
                control2?.setErrors({ ...control2?.errors, differentValues: true });

                return {
                    differentValues: true
                }
            }

            //! Be careful, this set all the errors of the control to null!
            // control2?.setErrors(null);
            //+ We can use this instead:
            if (control2?.errors && control2?.errors["differentValues"]) {
                delete control2.errors["differentValues"];
                if (Object.entries(control2.errors).length === 0)
                    control2.setErrors(null);
            }
            return null;
        }
    }
}
