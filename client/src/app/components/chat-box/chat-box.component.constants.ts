import { ChatEntryType } from '@common/chatbox-message';

export const CHAT_LIMIT = 200;
export const MESSAGE_TYPE = new Map<number, ChatEntryType>([
    [0, ChatEntryType.OPPONENT],
    [1, ChatEntryType.LOBBY],
    [2, ChatEntryType.GLOBAL],
]);

export const POSITION_NOT_FOUND = -1;

export const CHATBOX_STYLE = `
html,
body {
    height: 100%;
}
body {
    margin: 0;
    font-family: Roboto, 'Helvetica Neue', sans-serif;
}

.mat-raised-button {
    height: 35px;
    box-sizing: border-box;
    position: relative;
    -webkit-user-select: none;
    user-select: none;
    cursor: pointer;
    outline: none;
    border: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    display: inline-block;
    white-space: nowrap;
    text-decoration: none;
    vertical-align: baseline;
    text-align: center;
    margin: 0;
    min-width: 64px;
    line-height: 36px;
    padding: 0 16px;
    border-radius: 4px;
    overflow: visible;
    transform: translate3d(0, 0, 0);
    transition: background 400ms cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-container {
    height: inherit;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 5px 35px 5px rgba(0, 0, 0, 0.492);
    display: contents;
}

.chatbox-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 99%; // This is a hack to make the window non-scrollable
    width: 100%; // Needs to be 100% to make the chatbox fill the space
    border: 1px solid #9a8dde;
}
  
.chat-header {
    display: flex;
    justify-content: space-evenly;
    align-items: center; // Color needs to be removed because background is black
    padding: 10px;
    border-left: 2px dashed #998cde;
    border-top: 2px dashed #998cde;
    border-right: 2px dashed #998cde;
    font-size: 20px;
    height: 60px;
}
  
.chat-footer {
    display: flex;
    justify-content: space-between;
    padding: 5px;
    background-color: #f2f2f2;
}
  
.message-input {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.sending {
    padding-left: 5px;
    display: flex;
    flex-direction: column;
}
  
.send-btn {
    cursor: pointer;
    border: none;
    color:#4c84af;
    width: 35px;
    display: contents;
    justify-content: end;
}

.disabled {
    color:#4c84af5f;
    cursor: not-allowed;
}

.counter {
    color: black;
    font-size: 10px;
    display: flex;
    justify-content: center;
}

.chat-box-body {
    position: relative;
    overflow: hidden;
    background-color: rgb(104 58 181 / 44%);
    height: 100%;
}

.chat-logs {
    padding: 15px;
    height: 96.6%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column-reverse;
}

.chat-logs::-webkit-scrollbar-track
{
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}

.chat-logs::-webkit-scrollbar
{
    width: 8px;
}

.chat-logs::-webkit-scrollbar-thumb
{
    background-color: #ffffff;
    border-radius: 5px;
}

.chat-bubble {
    display: flex;
}

.chat-bubble.self {
    justify-content: flex-end;
}

.chat-bubble.opponent {
    justify-content: flex-start;
}

.chat-bubble.system {
    justify-content: center;
}

.chat {
    background:white;
    padding:5px 10px 5px 10px;
    color:#666;
    max-width:75%;
    position:relative;
    margin-bottom:5px;
    border-radius:15px;
    word-wrap:break-word;
}

.chat-bubble.self > .chat {
    background: #5A5EB9;
    color:white;
}

.chat-bubble.system > .chat {
    background: none;
    color:pink;
}

.chat-bubble.global > .chat {
    background: none;
    color: rgba(112, 241, 86, 0.918);
}

button:hover {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
}

`;
