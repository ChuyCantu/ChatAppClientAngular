import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AppOptionsService } from '../../services/app-options.service';

//* TEMP
type Message = {
    from: string;
    content: string;
}

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewInit {

    @ViewChild("input") inputRef!: ElementRef<HTMLInputElement>;

    emojiPickerVisible: boolean = false;
    
    // TODO: Change this to an object containing the msg
    messages: Message[] = [
        {
            from: this.authService.username,
            content: "Hey"
        },
        {
            from: "alice",
            content: "Hey Night"
        },
        {
            from: "alice",
            content: "How are you"
        },
        {
            from: this.authService.username,
            content: "Hi Alice!"
        },
        {
            from: this.authService.username,
            content: "Everything alright"
        },
        {
            from: this.authService.username,
            content: "What about you?"
        },
        {
            from: "alice",
            content: "That's great, and I'm fine thanks"
        },
        {
            from: this.authService.username,
            content: "I'm glad to hear that"
        },
    ];
    
    get username(): string {
        return this.authService.username;
    }

    get isSidePanelOpen(): boolean {
        return this.appOptions.isSidePanelOpen;
    }

    constructor(private authService: AuthService,
                private appOptions: AppOptionsService) { }

    ngAfterViewInit(): void {
        // Set max input height based on the initial height of the element
        const input: HTMLInputElement = this.inputRef.nativeElement;
        input.style.maxHeight = `${input.clientHeight * 5}px`;

        input.parentElement!.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            input.focus();
        });
    }

    send(): void {
        const input: HTMLInputElement = this.inputRef.nativeElement;
        
        if (input.innerText === "") return;

        this.messages.push({
            from: this.authService.username,
            content: input.innerText
        });
        input.innerText = "";
    }

    emojiClick(emojiEvent: any): void {
        const input: HTMLInputElement = this.inputRef.nativeElement;
        input.innerText += emojiEvent.emoji.native;

    }

    toogleEmojiPickerVisibility(): void {
        this.emojiPickerVisible = !this.emojiPickerVisible;
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
    }

    toggleSidePanelVisibility(): void {
        this.appOptions.toggleSidePanelVisibility();
    }

}
