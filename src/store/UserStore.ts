import {defineStore} from "pinia";
import TokenUtil from "../utils/TokenUtil";

export interface User {
    id: number,
    username: string,
    name: string,
    age: number,
    phone: string,
    auth: string[],
    token: string
}

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            user: {} as User,
        }
    },
    actions: {
        setUser(user: User) {
            this.user = user
            // 保存token到本地会话
            TokenUtil.setToken(user.token)
        }
    },
    getters: {

    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'user',
                storage: window.sessionStorage,
            },
        ]
    }
})