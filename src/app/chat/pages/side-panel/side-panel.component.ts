import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-side-panel',
    templateUrl: './side-panel.component.html',
    styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent {

    activeTab: number = 0;

    constructor() { }

    setActiveTab(tab: number): void {
        this.activeTab = tab;
    }
}
