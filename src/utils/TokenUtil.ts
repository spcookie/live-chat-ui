export default class TokenUtil {

    static getToken(): string | null {
        return window.sessionStorage.getItem('Token')
    }

    static setToken(token: string) {
        window.sessionStorage.setItem('Token', token)
    }

    static delToken() {
        window.sessionStorage.removeItem('Token')
    }
}