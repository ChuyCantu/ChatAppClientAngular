import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';

import Swal from 'sweetalert2';

import { FloatingElementComponent } from 'src/app/shared/components/floating-element/floating-element.component';
import { FriendID, FriendRelation } from '../../interfaces/chat-events';
import { AppOptionsService, SidePanelTab } from '../../services/app-options.service';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements AfterViewInit, OnDestroy {

    @ViewChild("floatingMenu") floatingMenu!: FloatingElementComponent;

    _outsideFloatingMenuClick = (e: Event) => this.hideFloatingMenu(e);

    get friends(): Map<FriendID, FriendRelation> {
        return this.chatService.friendRelations.friends;
    }

    constructor(private chatService: ChatService,
                private appOptions: AppOptionsService) { }

    ngAfterViewInit(): void {
        document.addEventListener("click", this._outsideFloatingMenuClick);
    }

    ngOnDestroy(): void {
        document.removeEventListener("click", this._outsideFloatingMenuClick);
    }

    openDeleteFriendConfirmation(friend: FriendRelation): void {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete this user from your friends!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteFriend(friend);
            }
        })

    }

    deleteFriend(friend: FriendRelation): void {
        this.chatService.deleteFriend(friend);
    }

    setActiveChat(friendId: number): void {
        this.chatService.setActiveChat(friendId);
        this.appOptions.setSidePanelTab(SidePanelTab.messages);

        if (window.innerWidth < this.appOptions.mobileMaxSize)
            this.appOptions.closeSidePanel();
    }

    showFloatingMenu(e: MouseEvent): void {
        e.stopPropagation();
        this.floatingMenu.show(e.target as HTMLElement);
    }

    hideFloatingMenu(e: Event): void {
        if (this.floatingMenu.isVisible &&
            !this.floatingMenu.containerRef.nativeElement
                .contains(e.target as HTMLElement)) {
            this.floatingMenu.hide();
        }
    }
}
