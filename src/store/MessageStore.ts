import {defineStore} from "pinia";
import {ref} from "vue";
import {Friend} from "../apis/FriendApi";

export const useMessageStore = defineStore('message', {
    state: () => {
        return {
            friends: ref<Friend[]>([])
        }
    }
})