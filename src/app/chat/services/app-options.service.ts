import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum SidePanelTab {
    messages,
    friends,
    add_friend,
    options
}

@Injectable({
    providedIn: 'root'
})
export class AppOptionsService {

    //* Invoked from main.component
    onMainPanelCloseAnimationEnded: Subject<void> = new Subject<void>();
    onMainPanelOpenAnimationEnded: Subject<void> = new Subject<void>();

    private readonly _mobileMaxSize: number = 576; // px
    private _isSidePanelOpen: boolean = true;
    private _sidePanelActiveTab: number = 0;

    get mobileMaxSize(): number {
        return this._mobileMaxSize;
    }

    get isSidePanelOpen(): boolean {
        return this._isSidePanelOpen;
    }

    get sidePanelActiveTab(): number {
        return this._sidePanelActiveTab;
    }

    get isViewMobile(): boolean {
        return window.innerWidth < this._mobileMaxSize;
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

    setSidePanelTab(sidePanelTab: SidePanelTab | number): void {
        this._sidePanelActiveTab = sidePanelTab;
    }
}
