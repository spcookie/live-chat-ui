import BaseService from "./index";

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'ADD_FRIEND' | 'ACCEPT_ADD_FRIEND'

export type ChatMessage  = {
    type: MessageType,
    id: number,
    from: {
        id: number,
        name: string,
        phone: number,
        age: number
    },
    date: string,
    text?: string,
    imageBase64?: string,
    originalFileName?: string,
    path?: string,
    size?: number
}

export type TextMessage = {
    target: {
        id: string
    },
    text: string
}

export type ImageMessage = {
    target: {
        id: string
    },
    imageBase64: string
}

export default class MessageApi {

    static loadFriendMessageById(id: string, page: number, size: number) {
        return BaseService.get(`/message/friend/${id}/${page}/${size}`)
    }

    static sendTextMessage(text: TextMessage) {
        return BaseService.put('/message/send/text', text)
    }

    static sendAddFriendMessage(id: number) {
        return BaseService.put('/message/send/addFriend/' + id)
    }

    static sendImgMessage(imageBase64: ImageMessage) {
        return BaseService.put('/message/send/image', imageBase64)
    }
}