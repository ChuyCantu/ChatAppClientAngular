import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { ChatRoutingModule } from './chat-routing.module';
import { MainComponent } from './pages/main/main.component';
import { MainPanelComponent } from './pages/main-panel/main-panel.component';
import { SidePanelComponent } from './pages/side-panel/side-panel.component';
import { ChatComponent } from './components/chat/chat.component';
import { ActiveChatsComponent } from './components/active-chats/active-chats.component';


@NgModule({
    declarations: [
        MainComponent,
        MainPanelComponent,
        SidePanelComponent,
        ChatComponent,
        ActiveChatsComponent,
    ],
    imports: [
        CommonModule,
        PickerModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
