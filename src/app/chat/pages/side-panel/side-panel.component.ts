import { Component, OnInit } from '@angular/core';
import { AppOptionsService } from '../../services/app-options.service';

@Component({
    selector: 'app-side-panel',
    templateUrl: './side-panel.component.html',
    styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent {

    get activeTab():number {
        return this.appOptions.sidePanelActiveTab;
    }

    constructor(private appOptions: AppOptionsService) { }

    setActiveTab(tab: number): void {
        this.appOptions.setSidePanelTab(tab);
    }
}
