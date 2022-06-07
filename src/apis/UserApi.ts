import BaseService from "./index";

export default class UserApi {

    static login(data: {username: string, password: string}) {
       return BaseService.post("/auth/login", data)
    }

    static loadUser() {
        return BaseService.get("/account/load")
    }

    static logout() {
        return BaseService.get('/logout')
    }
}