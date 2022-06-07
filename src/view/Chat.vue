<script setup lang="ts">
import {ref, watch, nextTick, onUnmounted} from "vue";
import {UserOutlined} from "@ant-design/icons-vue";
import MessageApi, {ChatMessage} from "../apis/MessageApi";
import {useRoute} from "vue-router";
import Bubble from "../components/Bubble.vue";
import {receiveMessages, removeSocketEvent} from "../socket/ChatSocket";
import FriendApi from "../apis/FriendApi";
import {message} from "ant-design-vue";
import {useMessageStore} from "../store/MessageStore";
import {storeToRefs} from "pinia";

const props = defineProps<{
  name: any,
  id: any
}>()

const route = useRoute()
const messageStore = useMessageStore()
const {friends} = storeToRefs(messageStore)

// 滚动到底部
const chatBox = ref<HTMLElement>({} as HTMLElement)
const scroll = () => {
  nextTick(() => {
    chatBox.value.scrollTop = chatBox.value.scrollHeight - chatBox.value.offsetHeight
  })
}
// 加载消息
const chatMsg = ref<ChatMessage[]>([])
const loadMag = (id: string) => {
  // 已读消息
  const idNum: number = Number.parseInt(id)
  FriendApi.confirmUnread(idNum).then(resp => {
    if (resp.data.code === 200) {
      for (let e of friends.value) {
        if (e.id === Number.parseInt(id)) {
          e.unread = 0
          break
        }
      }
    } else {
      message.warn('已读失败')
    }
  })
  MessageApi.loadFriendMessageById(id, 0, 10).then(resp => {
    if (resp.data.code === 200) {
      //加载消息数据
      chatMsg.value = resp.data.data.reverse() as ChatMessage[]
      //滚动
      scroll()
    }
  })
}
loadMag(props.id)
// 切换用户时重新加载消息
watch(
    () => route.params.id,
    async newId => {
      // 用户退出聊天窗口时url变化不再请求数据
      if (newId != undefined) {
        loadMag(newId as string)
      }
    }
)
//接收消息
let receiveMessage = ref<ChatMessage>({} as ChatMessage)
const callback = receiveMessages(receiveMessage)
onUnmounted(() => {
  removeSocketEvent(callback)
})
watch(
    () => receiveMessage.value,
    (message: any) => {
      // 收到消息后，判断消息的发送方是否是当前打开的好友窗口
      if (message.from.id == props.id) {
        // 判断是否是文本消息
        if (message.type === 'TEXT') {
          chatMsg.value.push(message)
          // 消息窗口滚动到底部
          scroll()
        }
      }
    })
// 判断是否有图片
const isHaveImage = ref(false)
// 解析图片
const imageView = ref()
const sendImage = function (e: Event) {
  const element = e.target as any
  if (element ?? false) {
    console.log(element.files)
    const {0: image} = element.files as FileList
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onloadend = () => {
      let base64 = reader.result
      imageView.value = base64 as string
      isHaveImage.value = true
    }
  }
}
// 发送消息
const sendMagVal = ref('')
const sendMessage = () => {
  // 文本消息校验
  let textPromise
  if (sendMagVal.value ?? false) {
    textPromise = MessageApi.sendTextMessage({
      target: {
        id: props.id,
      },
      text: sendMagVal.value
    })
    textPromise.then(() => {
      // 清空文本输入框的消息
      sendMagVal.value = ''
    })
  }
  // 图片消息发送
  let imageMessage
  if (isHaveImage.value) {
    imageMessage = MessageApi.sendImgMessage({
      target: {
        id: props.id,
      },
      imageBase64: imageView.value
    })
    imageMessage.then(() => {
      isHaveImage.value = false
      imageView.value = undefined
    })
  }
  // 所有信息发送完毕后
  if ((sendMagVal.value ?? false) && isHaveImage.value) {
    Promise.all([textPromise, imageMessage]).then(() => {
      // 发送完毕后重新更新消息
      loadMag(props.id)
      //滚动到底部
      scroll()
    })
  }
}
</script>

<script lang="ts">
export default {
  name: "Chat"
}
</script>

<template>
  <a-layout>
    <a-layout-content class="chat-top">
      <a-breadcrumb>
        <template #separator><span>></span></template>
        <a-breadcrumb-item>
          <user-outlined/>
          <span>好友</span>
        </a-breadcrumb-item>
        <a-breadcrumb-item>{{ name }}</a-breadcrumb-item>
      </a-breadcrumb>
    </a-layout-content>
    <a-layout-content class="chat-window">
      <div class="chat-message" ref="chatBox">
        <template v-for="item in chatMsg" :key="item.id">
          <Bubble :item="item"></Bubble>
        </template>
      </div>
      <div class="chat-tools">
        <input type="file" @change="sendImage" ref="images" accept="image/*"/>
      </div>
      <div class="chat-bottom">
        <a-textarea
            v-model:value="sendMagVal"
            :auto-size="false"
            @keydown.enter="sendMessage"
        />
        <img class="image-view" v-if="imageView" :src="imageView" alt="图片">
        <a-button type="primary" @click="sendMessage">发送消息</a-button>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style scoped lang="scss">
.chat-top {
  height: 10%;

  :deep(.ant-breadcrumb) {
    padding: 1% 3%;
  }
}

.chat-window {
  height: 90%;

  .chat-message {
    height: 76%;
    overflow: auto;
    scroll-margin-top: 0;
  }

  .chat-tools {
    height: 4%;
    background-color: #c73838;
  }

  .chat-bottom {
    position: relative;
    top: 0;
    left: 0;
    height: 20%;
    overflow: auto;

    > textarea {
      height: 100%;
      resize: none;
    }

    > button {
      position: absolute;
      bottom: 0;
      right: 0;
    }

    > .image-view {
      position: absolute;
      top: 0;
      left: 0;
      height: 100px;
      width: 100px;
    }
  }
}
</style>