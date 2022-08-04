import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';
import { AppOptionsService, SidePanelTab } from '../../services/app-options.service';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.css']
})
export class OptionsComponent {

    constructor(private authService: AuthService,
                private router: Router,
                private appOptions: AppOptionsService,
                private chatService: ChatService) { }


    logout(): void {
        this.authService.logout()
            .subscribe((resp) => {
                this.appOptions.setSidePanelTab(SidePanelTab.messages);
                this.router.navigateByUrl("/auth/login")
            });
    }

    deleteAccount(): void {
        Swal.fire({
            title: 'Are you sure you want to delete your account?',
            text: "This will also delete your chats. This process is irreversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.chatService.deleteAccount();   
                this.logout();
            }
        })
    }
}
