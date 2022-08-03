import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounce, Subject, Subscription, timer } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FriendRelation, Message } from '../../interfaces/chat-events';
import { AppOptionsService } from '../../services/app-options.service';

import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

    @ViewChild("chat") chatRef!: ElementRef<HTMLElement>;
    @ViewChild("input") inputRef!: ElementRef<HTMLInputElement>;
    @ViewChild("emojiPicker") emojiPickerRef!: ElementRef<HTMLElement>;
    @ViewChild("topChatElement") topChatElementRef!: ElementRef<HTMLElement>;

    // enableLoadingAtTop: Subject<void> = new Subject<void>();

    emojiPickerVisible: boolean = false;
    showScrollToBottomButton: boolean = false;
    
    private appearAtTheBottom: boolean = true;
    // private canLoadWhenOnTop: boolean = false;
    private lastScrollHeight: number = 0;

    private _sidePanelOpenEndSubscription!: Subscription;
    private newMsgScrollSubscription!: Subscription;
    private oldMsgReceivedSubscription!: Subscription;
    private activeChatChangedSubscription!: Subscription;
    private _emojiPickerEventListener = 
        (e: Event) => this.emojiPickerClickHandler(e);
    private _scrollHandler = (e: Event) => {
        const scrollOnBottom = this.isScrollAtTheBottom();
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

    get activeChatFriendRelation(): FriendRelation | null {
        return this.chatService.activeChatFriendRelation;
    }

    // busy: boolean = false;
    get busy(): boolean {
        if (!this.activeChatFriendRelation) return false;

        return this.chatService.chatsMetadata
            .get(this.activeChatFriendRelation.user.id)!.busyLoadingOldMessages;
    }

    constructor(private authService: AuthService,
                private appOptions: AppOptionsService,
                private chatService: ChatService) { }

    ngOnInit(): void {
        this.newMsgScrollSubscription = this.chatService.onNewMessageReceived.subscribe(() => {
            if (!this.isScrollAtTheBottom()) return;

            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(), 0);
        });

        this.oldMsgReceivedSubscription = this.chatService.onFriendMessagesReceived.subscribe(() => {
            // if (this.canLoadWhenOnTop)
            //     this.canLoadWhenOnTop = false;

            if (!this.isScrollAtTheBottom()) return;
            
            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(), 0);
        });

        this.activeChatChangedSubscription = this.chatService.onActiveChatChanged.subscribe(() => {
            this.clearInput();
            this.appearAtTheBottom = true;

            // Translate the element to detect we scrolled to the top so it can exit and enter
            // the intersection observable when the chat messages occupy the same amount of space of
            // the chat element so we can load more messages if available
            this.topChatElementRef.nativeElement.style.transform = "translateY(-5px)";
            setTimeout(() => this.topChatElementRef.nativeElement.style.transform = "translateY(0)", 100);
        }); 

        this._sidePanelOpenEndSubscription = this.appOptions.onMainPanelCloseAnimationEnded.subscribe(() => {
            if (this.appOptions.isViewMobile)   
                this.chatService.clearActiveChat();
        });

        // Create subscription to enable loading old messages when reaching the top of the scroll
        // this.enableLoadingAtTop.pipe(
        //     debounce(() => timer(150))
        // ).subscribe(() => this.canLoadWhenOnTop = true);
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

        // Set up intersection detection to the top element
        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            if (!entries[0].isIntersecting || !this.activeChatFriendRelation || this.busy) return;

            if (this.chatService.chatsMetadata.get(this.activeChatFriendRelation.user.id)?.canLoadMoreMessages) {
                this.chatService.requestPastMessages(this.activeChatFriendRelation!.user.id);
                this.lastScrollHeight = chat.scrollHeight;
                console.log(entries)
            }
        }, {
           root: chat,
           rootMargin: "0px",
           threshold: 1
        });
        observer.observe(this.topChatElementRef.nativeElement);
    }

    ngAfterViewChecked(): void {
        if (!this.appearAtTheBottom) {
            // const chat = this.chatRef.nativeElement;
            // if (this.activeChatFriendRelation && this.isScrollAtTheTop()
            //     && chat.scrollHeight != chat.clientHeight && this.canLoadWhenOnTop && !this.busy) {
            //     console.log(chat.scrollTop, chat.scrollHeight, chat.clientHeight);
            //     this.lastScrollHeight = chat.scrollHeight;
            //     setTimeout(() => {
            //         // this.busy = true;
            //         this.chatService.requestPastMessages(this.activeChatFriendRelation!.user.id);
            //     }, 0);
            //     // setTimeout(() => this.busy = false, 350);
            // }
            // if (!this.canLoadWhenOnTop && this.activeChatFriendRelation) {
            //     this.enableLoadingAtTop.next();

            //     if (this.lastScrollHeight != 0) {
            //         chat.scrollTo({ top: chat.scrollHeight - this.lastScrollHeight, behavior: "auto" });

            //         this.lastScrollHeight = 0;
            //     }
            // }
            const chat = this.chatRef.nativeElement;
            if (this.lastScrollHeight != 0 && this.lastScrollHeight != chat.scrollHeight) {
                chat.scrollTo({ top: chat.scrollHeight - this.lastScrollHeight, behavior: "auto" });
                this.lastScrollHeight = 0;
            }

            return;
        }

        this.appearAtTheBottom = false;
        this.scrollToBottom(false);
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this._emojiPickerEventListener);
        this.chatRef.nativeElement.removeEventListener("scroll", this._scrollHandler);
        this.newMsgScrollSubscription.unsubscribe();
        this.oldMsgReceivedSubscription.unsubscribe();
        this.activeChatChangedSubscription.unsubscribe();
        this._sidePanelOpenEndSubscription.unsubscribe();
    }

    send(): void {
        const input: HTMLInputElement = this.inputRef.nativeElement;
        
        if (input.innerText === "") return;

        this.chatService.sendMessage(this.activeChatFriendRelation?.user.id!, input.innerText);

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

    isScrollAtTheTop(): boolean {
        return this.chatRef.nativeElement.scrollTop === 0;
    }

    isScrollAtTheBottom(): boolean {
        const chat = this.chatRef.nativeElement;
        return chat.scrollHeight - chat.scrollTop === chat.clientHeight;
    }

    scrollToBottom(smooth: boolean = true): void {
        const chat = this.chatRef.nativeElement;
        chat.scrollTo({ top: chat.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    }
}
