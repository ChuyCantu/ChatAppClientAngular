import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Message } from '../../interfaces/chat-events';
import { AppOptionsService } from '../../services/app-options.service';

import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("chat") chatRef!: ElementRef<HTMLElement>;
    @ViewChild("input") inputRef!: ElementRef<HTMLInputElement>;
    @ViewChild("emojiPicker") emojiPickerRef!: ElementRef<HTMLElement>;

    emojiPickerVisible: boolean = false;
    
    showScrollToBottomButton: boolean = false;

    private newMsgScrollSubscription!: Subscription;
    private oldMsgReceivedSubscription!: Subscription;
    private activeChatChangedSubscription!: Subscription;
    private _emojiPickerEventListener = 
        (e: Event) => this.emojiPickerClickHandler(e);
    private _scrollHandler = (e: Event) => {
        const scrollOnBottom = this.isScrollOnBottom();
        if (this.showScrollToBottomButton === scrollOnBottom) {
            this.showScrollToBottomButton = !scrollOnBottom;
        }
    };
    
    get messages(): Message[] {
        return this.chatService.getMessagesFrom(this.chatService.activeChatFriendRelation?.user.id!);
    }
    
    get username(): string {
        return this.authService.username;
    }

    get userId(): number {
        return this.authService.userId;
    }

    get isSidePanelOpen(): boolean {
        return this.appOptions.isSidePanelOpen;
    }

    get friendUsername(): string {
        return this.chatService.activeChatFriendRelation?.user.username || "";
    }

    constructor(private authService: AuthService,
                private appOptions: AppOptionsService,
                private chatService: ChatService) { }

    ngOnInit(): void {
        this.newMsgScrollSubscription = this.chatService.onNewMessageReceived.subscribe(() => {
            if (!this.isScrollOnBottom()) return;

            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(), 0);
        });

        this.oldMsgReceivedSubscription = this.chatService.onFriendMessagesReceived.subscribe(() => {
            if (!this.isScrollOnBottom()) return;
            
            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(), 0);
        });

        this.activeChatChangedSubscription = this.chatService.onActiveChatChanged.subscribe(() => {
            this.clearInput();
            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(false), 0);
        });
    }

    ngAfterViewInit(): void {
        // Set max input height based on the initial height of the element
        const input: HTMLInputElement = this.inputRef.nativeElement;
        input.style.maxHeight = `${input.clientHeight * 5}px`;

        // Make fake input get focus when we click the container
        input.parentElement!.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            input.focus();
        });

        // Hide emoji picker when clicked outside
        document.addEventListener('click', this._emojiPickerEventListener);

        // Also listen to scroll events to show/hide floating button
        const chat = this.chatRef.nativeElement;
        chat.addEventListener("scroll", this._scrollHandler);
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this._emojiPickerEventListener);
        this.chatRef.nativeElement.removeEventListener("scroll", this._scrollHandler);
        this.newMsgScrollSubscription.unsubscribe();
        this.oldMsgReceivedSubscription.unsubscribe();
        this.activeChatChangedSubscription.unsubscribe();
    }

    send(): void {
        const input: HTMLInputElement = this.inputRef.nativeElement;
        
        if (input.innerText === "") return;

        this.chatService.sendMessage(this.chatService.activeChatFriendRelation?.user.id!, input.innerText);

        this.clearInput();
    }

    clearInput(): void {
        this.inputRef.nativeElement.innerText = "";
    }

    emojiClick(emojiEvent: any): void {
        const input: HTMLInputElement = this.inputRef.nativeElement;
        input.innerText += emojiEvent.emoji.native;

    }

    toggleEmojiPickerVisibility(): void {
        this.emojiPickerVisible = !this.emojiPickerVisible;
    }

    emojiPickerClickHandler(e: Event): void {
        if (this.emojiPickerVisible &&
            !this.emojiPickerRef.nativeElement
                .contains(e.target as HTMLElement)) {
            this.emojiPickerVisible = false
        }
    }

    //+ Utility to apply grouping style to chat bubbles
    isLastMessageOfGroup(idx: number): boolean {
        if (idx + 1 < this.messages.length){
            return this.messages[idx].from != this.messages[idx + 1].from; 
        }
        return true;
    }

    openSidePanel(): void {
        this.appOptions.openSidePanel();
        this.clearInput();
    }

    toggleSidePanelVisibility(): void {
        this.appOptions.toggleSidePanelVisibility();
    }

    isScrollOnBottom(): boolean {
        const chat = this.chatRef.nativeElement;
        return chat.scrollHeight - chat.scrollTop === chat.clientHeight;
    }

    scrollToBottom(smooth: boolean = true): void {
        const chat = this.chatRef.nativeElement;
        chat.scrollTo({ top: chat.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    }
}
