import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { TranslateService } from '@app/services/translate/translate.service';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Subscription } from 'rxjs';
import { CHATBOX_STYLE, CHAT_LIMIT } from './chat-box.component.constants';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnChanges, OnDestroy {
    @ViewChild('messageInput') messageInput: ElementRef<HTMLInputElement>;
    @ViewChild('counter') counter: ElementRef<HTMLSpanElement>;
    @ViewChild('sendBtn') sendBtn: ElementRef<HTMLButtonElement>;
    @ViewChild('chatbox') chatboxElement: ElementRef;
    @Input() deleteMessage: number;
    @Input() isGlobal: boolean;
    @Input() isLobby: boolean;
    @Input() parent: HTMLElement;
    @Output() isAttachedEmitter = new EventEmitter<boolean>();
    chatLimit: number;
    message: string;
    protected isAttached: boolean;
    private messageSubscriber: Subscription;
    private deleteMessageEqualiser: number;

    // eslint-disable-next-line max-params
    constructor(
        public messageService: MessageService,
        public gameService: GameService,
        public accountService: AccountService,
        protected translateService: TranslateService,
    ) {
        this.isGlobal = false;
        this.isLobby = false;
        this.messageSubscriber = this.messageService.messageSubject.subscribe((data: ChatEntry) => {
            if ((data.type === ChatEntryType.GLOBAL_CHAT && this.isGlobal) || (data.type === ChatEntryType.USER && !this.isGlobal)) {
                if (data.playerName === this.accountService.pseudo) data.type = ChatEntryType.SELF;
                this.generateMessage({
                    message: data.message,
                    type: data.type,
                    timestamp: data.timestamp,
                    playerName: data.playerName,
                } as ChatEntry);
            } else if (data.type === ChatEntryType.LOBBY && this.isLobby) {
                if (data.playerName === this.accountService.pseudo) data.type = ChatEntryType.SELF;
                this.generateMessage({
                    message: data.message,
                    type: data.type,
                    timestamp: data.timestamp,
                    playerName: data.playerName,
                } as ChatEntry);
            }
        });
        this.chatLimit = CHAT_LIMIT;
        this.message = '';
        this.deleteMessageEqualiser = 0;
        this.messageService.clearMessages();
        this.isAttached = true;
        this.isAttachedEmitter.emit(this.isAttached);
    }

    get chatEntryType(): typeof ChatEntryType {
        return ChatEntryType;
    }

    ngOnChanges(): void {
        if (this.deleteMessage + this.deleteMessageEqualiser) {
            this.deleteMessage++;
            this.messageService.clearMessages();
        }
    }

    ngOnDestroy(): void {
        this.messageSubscriber.unsubscribe();
    }

    // isGlobal is true when you want to send a global message to all players
    // isGlobal is false when you want to send a message only within a same games
    send(): void {
        if (this.isMessageValid() && !this.gameService.getEndPopUpVisibility()) {
            this.messageService.sendMessage(this.message, this.accountService.pseudo, this.isGlobal, this.isLobby);
        }
    }

    adjustCounterAndSendBtn(): void {
        this.counter.nativeElement.style.color = this.isMessageLengthValid() ? 'black' : 'red';
        if (this.isMessageValid()) {
            this.sendBtn.nativeElement.disabled = false;
            this.sendBtn.nativeElement.className = 'send-btn';
        } else {
            this.sendBtn.nativeElement.disabled = true;
            this.sendBtn.nativeElement.className = 'send-btn disabled';
        }
    }

    isMessageLengthValid(): boolean {
        return this.message.length <= CHAT_LIMIT;
    }

    isMessageValid(): boolean {
        return this.isMessageLengthValid() && this.message.trim().length > 0;
    }

    generateMessage(entry: ChatEntry): void {
        this.gameService.registerEvent({
            this: this,
            method: this.generateMessage,
            params: [entry.message, entry.type, entry.timestamp],
            timestamp: Number(entry.timestamp),
        });

        this.messageService.addMessage(entry, this.isGlobal, this.accountService.pseudo);

        if (entry.type === ChatEntryType.SELF) {
            this.message = '';
            this.adjustCounterAndSendBtn();
        }
    }

    inputSelected(): void {
        this.gameService.disableKeyListener();
    }

    inputUnselected(): void {
        this.gameService.enableKeyListener();
    }

    toggleChatboxAttachment() {
        this.isAttached = !this.isAttached;
        this.isAttachedEmitter.emit(this.isAttached);
        if (this.isAttached) {
            this.attachChatbox();
        } else {
            this.detachChatbox();
        }
        this.messageInput.nativeElement.focus();
    }

    attachChatbox() {
        // Attach the chatbox back to the main application
        this.parent.appendChild(this.chatboxElement.nativeElement);
        this.accountService.closeChatboxWindow();
        this.isAttached = true;
        this.isAttachedEmitter.emit(this.isAttached);
    }

    detachChatbox() {
        // Detach the chatbox from the main application
        const detachedChatbox = this.chatboxElement.nativeElement;
        this.accountService.externalWindow = window.open('', '_blank', 'width=400,height=400');
        if (this.accountService.externalWindow) {
            this.accountService.externalWindow.document.title = 'Chatbox';
            const link = document.createElement('style');
            link.textContent = CHATBOX_STYLE;
            this.accountService.externalWindow.document.head.appendChild(link);
            const material = document.createElement('link');
            material.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
            material.rel = 'stylesheet';
            this.accountService.externalWindow.document.head.appendChild(material);
            this.accountService.externalWindow.document.body.appendChild(detachedChatbox);
            this.accountService.externalWindow.onbeforeunload = () => {
                if (!this.isAttached) {
                    // Closing the chatbox window using the X button
                    this.toggleChatboxAttachment();
                }
            };
        }
    }
}
