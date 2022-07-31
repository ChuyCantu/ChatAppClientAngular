import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppOptionsService {

    private _isSidePanelOpen: boolean = true;

    get isSidePanelOpen(): boolean {
        return this._isSidePanelOpen;
    }

    constructor() { }

    openSidePanel(): void {
        this._isSidePanelOpen = true;
    }

    closeSidePanel(): void {
        this._isSidePanelOpen = false;
    }

    toggleSidePanelVisibility(): void {
        this._isSidePanelOpen = !this._isSidePanelOpen;
    }
}
