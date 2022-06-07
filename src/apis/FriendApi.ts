import BaseService from "./index";

export type Friend = {
    id: number,
    // username: string,
    name: string,
    age: number,
    phone: number,
    unread: number
}

export type Account = {
    id?: number,
    username: string,
    name: string,
    phone: string,
    age: string
}

export default class FriendApi {
    static loadFriends() {
        return BaseService.get('/friend/load/friendList')
    }

    static loadAllUnreadCount() {
        return BaseService.get('/message/unread/count')
    }

    static confirmUnread(id: number) {
        return BaseService.put('/message/unread/confirm/' + id)
    }

    static searchFriend(account: Account) {
        return BaseService.post('/friend/find', account)
    }

    static loadAddFriend() {
        return BaseService.get('/friend/load/friendVerify')
    }

    static handleAddFriendMessage(id: number, code: boolean) {
        return BaseService.put(`/friend/${id}/${code}`)
    }
}