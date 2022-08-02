import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateSmallPipe } from './pipes/date-small.pipe';



@NgModule({
    declarations: [
        DateSmallPipe
    ],
    imports: [
        CommonModule
    ],
    exports: [
        DateSmallPipe
    ]
})
export class SharedModule { }
