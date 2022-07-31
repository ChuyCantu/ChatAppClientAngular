import { Component } from '@angular/core';

import { AppOptionsService } from '../../services/app-options.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent {

    get isSidePanelOpen(): boolean {
        return this.appOptions.isSidePanelOpen;
    }

    constructor(private appOptions: AppOptionsService) { }

    toggleSidePanelVisibility(): void {
        this.appOptions.toggleSidePanelVisibility();
    }

}
