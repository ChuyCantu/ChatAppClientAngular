import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
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
    @ViewChild("bottomChatElement") bottomChatElementRef!: ElementRef<HTMLElement>;

    typingDebouncer: Subject<string> = new Subject<string>();
    private _typing: boolean = false;

    emojiPickerVisible: boolean = false;
    // showScrollToBottomButton: boolean = false;
    isScrollAtTheBottom: boolean = true;
    stickyScrollWhileTyping = false;
    
    private appearAtTheBottom: boolean = true;
    private lastScrollHeight: number = 0;
    private prevInsertedDate: string = ""; // Used for the chat UI only

    private _intersectionTopObserver!: IntersectionObserver;
    private _intersectionBottomObserver!: IntersectionObserver;
    private _sidePanelOpenEndSubscription!: Subscription;
    private newMsgScrollSubscription!: Subscription;
    private oldMsgReceivedSubscription!: Subscription;
    private activeChatChangedSubscription!: Subscription;
    private _emojiPickerEventListener = 
        (e: Event) => this.emojiPickerClickHandler(e);
    
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

    get isFriendTyping(): boolean {
        return this.chatService.chatsMetadata.get(this.activeChatFriendRelation!.user.id)!.typing;
    }

    constructor(private authService: AuthService,
                private appOptions: AppOptionsService,
                private chatService: ChatService) { }

    ngOnInit(): void {
        this.newMsgScrollSubscription = this.chatService.onNewMessageReceived.subscribe(() => {
            if (!this.isScrollAtTheBottom) return;

            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(), 100);
        });

        this.oldMsgReceivedSubscription = this.chatService.onFriendMessagesReceived.subscribe(() => {
            if (!this.isScrollAtTheBottom) return;
            
            // Wait for change to reflect on the DOM
            setTimeout(() => this.scrollToBottom(), 100);
        });

        this.activeChatChangedSubscription = this.chatService.onActiveChatChanged.subscribe(() => {
            this.clearInput();
            this.appearAtTheBottom = true;

            // Translate the element to detect so it can exit and enter the intersection observable
            // when the chat messages occupy the same amount of space as the chat container so we
            // can load more messages if available even when scrolling is not possible
            this.topChatElementRef.nativeElement.style.transform = "translateY(-5px)";
            setTimeout(() => this.topChatElementRef.nativeElement.style.transform = "translateY(0)", 100);
        }); 

        this._sidePanelOpenEndSubscription = this.appOptions.onMainPanelCloseAnimationEnded.subscribe(() => {
            if (this.appOptions.isViewMobile)   
                this.chatService.clearActiveChat();
        });

        // Configure typing debouncer event
        this.typingDebouncer.pipe(
            debounceTime(500)
        ).subscribe(_ => {
            this._typing = false;
            this.chatService.notifyTyping(this.activeChatFriendRelation?.user.id!, false);
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
        
        this._intersectionBottomObserver = new IntersectionObserver(
            (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            this.isScrollAtTheBottom = entries[0].isIntersecting;
        }, {
            root: chat,
            rootMargin: "0px",
            threshold: 1
        });
        this._intersectionBottomObserver.observe(this.bottomChatElementRef.nativeElement);

        // Set up intersection detection to the top element
        this._intersectionTopObserver = new IntersectionObserver(
            (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            if (!entries[0].isIntersecting || !this.activeChatFriendRelation || this.busy) return;

            if (this.chatService.chatsMetadata.get(this.activeChatFriendRelation.user.id)?.canLoadMoreMessages) {
                this.chatService.requestPastMessages(this.activeChatFriendRelation!.user.id);
                this.lastScrollHeight = chat.scrollHeight;
            }
        }, {
           root: chat,
           rootMargin: "0px",
           threshold: 1
        });
        this._intersectionTopObserver.observe(this.topChatElementRef.nativeElement);
    }

    ngAfterViewChecked(): void {
        if (!this.appearAtTheBottom) {
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
        this.newMsgScrollSubscription.unsubscribe();
        this.oldMsgReceivedSubscription.unsubscribe();
        this.activeChatChangedSubscription.unsubscribe();
        this._sidePanelOpenEndSubscription.unsubscribe();
        this._intersectionTopObserver.disconnect();
        this._intersectionBottomObserver.disconnect();
    }

    send(): void {
        const input: HTMLInputElement = this.inputRef.nativeElement;

        input.focus();
        
        if (input.innerText === "") return;

        this.chatService.sendMessage(this.activeChatFriendRelation?.user.id!, input.innerText);

        this.clearInput();
    }

    clearInput(): void {
        this.inputRef.nativeElement.innerText = "";
    }

    typing(): void {
        this.typingDebouncer.next(this.inputRef.nativeElement.innerText);

        if (!this._typing) {
            this._typing = true;
            this.stickyScrollWhileTyping = this.isScrollAtTheBottom;
            this.chatService.notifyTyping(this.activeChatFriendRelation?.user.id!, true);
        }

        // If the scroll is pushed and we want it to stick at the bottom, scroll it down
        setTimeout(() => {
            if (!this.isScrollAtTheBottom && this.stickyScrollWhileTyping) {
                this.scrollToBottom(false);
            }
        }, 5);
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

    shouldInsertDateHeader(formatedDate: string, index: number): boolean {
        if (index === 0 || formatedDate !== this.prevInsertedDate) {
            this.prevInsertedDate = formatedDate;
            return true;
        }
        
        return false;
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

    scrollToBottom(smooth: boolean = true): void {
        const chat = this.chatRef.nativeElement;
        chat.scrollTo({ top: chat.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    }
}
