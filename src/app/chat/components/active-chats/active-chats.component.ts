import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-active-chats',
  templateUrl: './active-chats.component.html',
  styleUrls: ['./active-chats.component.css']
})
export class ActiveChatsComponent implements OnInit {

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
      this.chatService.connect();
  }

}
