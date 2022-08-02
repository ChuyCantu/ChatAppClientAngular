import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { ChatRoutingModule } from './chat-routing.module';
import { MainComponent } from './pages/main/main.component';
import { MainPanelComponent } from './pages/main-panel/main-panel.component';
import { SidePanelComponent } from './pages/side-panel/side-panel.component';
import { ChatComponent } from './components/chat/chat.component';
import { ActiveChatsComponent } from './components/active-chats/active-chats.component';
import { FriendsComponent } from './components/friends/friends.component';
import { AddFriendComponent } from './components/add-friend/add-friend.component';
import { OptionsComponent } from './components/options/options.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
    declarations: [
        MainComponent,
        MainPanelComponent,
        SidePanelComponent,
        ChatComponent,
        ActiveChatsComponent,
        FriendsComponent,
        AddFriendComponent,
        OptionsComponent,
    ],
    imports: [
        CommonModule,
        PickerModule,
        SharedModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
