import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

    isSidePanelOpen: boolean = true;

    constructor() { }

    ngOnInit(): void {
    }

    openMenu(): void {
        this.isSidePanelOpen = true;
    }

    closeMenu(): void {
        this.isSidePanelOpen = false;
    }

}
