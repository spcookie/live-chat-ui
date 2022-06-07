import {RouteRecordRaw} from "vue-router";

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            requiresAuth: false
        },
        component: () => import('/src/view/Login.vue')
    },
    {
        path: '/main',
        name: 'MainFace',
        meta: {
            requiresAuth: true
        },
        component: () => import('/src/view/MainFace.vue'),
        children: [
            {
                path: '/chat/:id/:name',
                name: 'Chat',
                meta: {
                    requiresAuth: true
                },
                props: true,
                component: () => import('/src/view/Chat.vue'),
            }
        ]
    }
]