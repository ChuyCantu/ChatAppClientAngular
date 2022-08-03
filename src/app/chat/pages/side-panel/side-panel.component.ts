import { Component, OnInit } from '@angular/core';
import { AppOptionsService } from '../../services/app-options.service';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-side-panel',
    templateUrl: './side-panel.component.html',
    styleUrls: ['./side-panel.component.css']
})
export class SidePanelComponent {

    get unreadMessagesCount(): number {
        let total = 0;
        for (let md of this.chatService.chatsMetadata.values()) {
            total += md.unreadMessages;
        }
        return total;
    }

    get friendRequestsCount(): number {
        return this.chatService.friendRelations.friendRequests.length;
    }

    get activeTab():number {
        return this.appOptions.sidePanelActiveTab;
    }

    constructor(private appOptions: AppOptionsService,
                private chatService: ChatService) { }

    setActiveTab(tab: number): void {
        this.appOptions.setSidePanelTab(tab);
    }
}
