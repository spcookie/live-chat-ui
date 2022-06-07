import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import {routes} from "./routes";


const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 路由拦截，判断用户是否登录
router.beforeEach((to, from) => {
    if (to.meta.requiresAuth) {
       const token = window.sessionStorage.getItem('Token')
        if (token) {
            return true
        } else {
            return {
                name: 'Login',
                replace: true
            }
        }
    }
    return true
})

router.afterEach((to, from) => {

})

export default router;