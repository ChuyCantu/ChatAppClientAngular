import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DateSmallPipe } from './pipes/date-small.pipe';
import { FloatingElementComponent } from './components/floating-element/floating-element.component';

@NgModule({
    declarations: [
        DateSmallPipe,
        FloatingElementComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        DateSmallPipe,
        FloatingElementComponent
    ]
})
export class SharedModule { }
