import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { MainComponent } from './pages/main/main.component';
import { ChatPanelComponent } from './components/chat-panel/chat-panel.component';
import { ChatMenuComponent } from './components/chat-menu/chat-menu.component';


@NgModule({
    declarations: [
    MainComponent,
    ChatPanelComponent,
    ChatMenuComponent
  ],
    imports: [
        CommonModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
