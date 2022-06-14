import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import 'ant-design-vue/dist/antd.css';
import 'ant-design-vue/es/message/style/css';
import 'animate.css';

const app = createApp(App)
// 添加路由
app.use(router)
// 添加状态管理
app.use(store)
// 添加事件总线
app.config.globalProperties.$bus = app
// 挂载
app.mount('#app')
