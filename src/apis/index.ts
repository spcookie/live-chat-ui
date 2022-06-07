import axios from "axios";
import {message} from "ant-design-vue";

const BaseService = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    timeout: 0,
    withCredentials: true,
})

BaseService.interceptors.request.use(
    request => {
        const token = window.sessionStorage.getItem("Token")
        if (token) {
            // 添加Token
            // @ts-ignore
            request.headers.Authorization = token
        }
        // 通一添加/api前缀
        request.url = "api" + request.url
        return request
    })

BaseService.interceptors.response.use(response => {
    if (response.data.code == 401) {
        message.warn('登录已过期, 请重新登录')
    }
    return response
}, error => {
    message.error('服务器出了一点小问题', 1)
    return Promise.resolve()
})

export default BaseService