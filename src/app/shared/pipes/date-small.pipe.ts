import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateSmall'
})
export class DateSmallPipe implements PipeTransform {

    transform(value: string): string {
        const date = new Date(value);
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0);
        const yesterdayMidnight = new Date(midnight);
        yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
        
        if (date < yesterdayMidnight)
            return formatDate(yesterdayMidnight, "shortDate", "en-US");
        if (date < midnight) 
            return "yesterday";
        else
            return formatDate(date, "shortTime", "en-US");
    }

}
