import {ChatMessage, MessageType} from "../apis/MessageApi";
import {Ref, UnwrapRef} from "@vue/reactivity";
import TokenUtil from "../utils/TokenUtil";
import {message as _message} from "ant-design-vue";

let chat: WebSocket | null = null

const connectSocket = () => {
    chat = new WebSocket('ws://localhost:8080/socket/chat', [
        window.sessionStorage.getItem('Token') as string
    ])
    chat.addEventListener('error', () => {
        _message.error('与服务器连接失败')
    })
}

// 处理窗口刷新
const token = TokenUtil.getToken()
if (token) {
 connectSocket()
}

const registerSocketEvents = (callback: (this: WebSocket, ev: WebSocketEventMap['message']) => any) => {
    if (chat != null) {
        chat.addEventListener('message', callback)
    } else {
        _message.error('与服务器连接失败')
    }
}

const receiveMessages = (message: Ref<UnwrapRef<ChatMessage>>): ((this: WebSocket, ev: WebSocketEventMap['message']) => any) | null => {
    if (chat != null) {
        const callback = (ev: WebSocketEventMap['message']) => {
            message.value = JSON.parse(ev.data)
            console.log(JSON.parse(ev.data))
        }
        chat.addEventListener('message', callback)
        return callback
    } else {
        _message.error('与服务器连接失败')
        return null
    }
}

const removeSocketEvent = (callback: ((this: WebSocket, ev: WebSocketEventMap['message']) => any) | null) => {
    if (chat != null && callback != null) {
        chat.removeEventListener('message', callback)
    }
}

export {registerSocketEvents, receiveMessages, connectSocket, removeSocketEvent}