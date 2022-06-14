import BaseService from "./index";

export default class UserApi {

    static login(data: {username: string, password: string}) {
       return BaseService.post("/auth/login", data)
    }

    static logout() {
        return BaseService.get('/logout')
    }

    static register(account: any) {
        return BaseService.post('/account/register', account)
    }
}