import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { MainComponent } from './pages/main/main.component';
import { MainPanelComponent } from './pages/main-panel/main-panel.component';
import { SidePanelComponent } from './pages/side-panel/side-panel.component';


@NgModule({
    declarations: [
    MainComponent,
    MainPanelComponent,
    SidePanelComponent,
  ],
    imports: [
        CommonModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
