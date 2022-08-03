import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { AppOptionsService } from '../../services/app-options.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements AfterViewInit, OnDestroy {

    private _mainPanelCloseHandler = (e: Event) => {
        if (this.appOptions.isSidePanelOpen)
            this.appOptions.onMainPanelCloseAnimationEnded.next();
        else 
            this.appOptions.onMainPanelOpenAnimationEnded.next();
    };

    get isSidePanelOpen(): boolean {
        return this.appOptions.isSidePanelOpen;
    }

    constructor(private appOptions: AppOptionsService) { }

    ngAfterViewInit(): void {
        const mainPanel = document.getElementById("mainPanel")!;

        mainPanel.addEventListener("transitionend", this._mainPanelCloseHandler);
    }

    ngOnDestroy(): void {
        const mainPanel = document.getElementById("mainPanel")!;

        mainPanel.removeEventListener("transitionend", this._mainPanelCloseHandler);
    }

    toggleSidePanelVisibility(): void {
        this.appOptions.toggleSidePanelVisibility();
    }

}
