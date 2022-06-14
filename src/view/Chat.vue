<script setup lang="ts">
import {ref, watch, nextTick, onUnmounted, h, reactive} from "vue";
import {UserOutlined, PictureOutlined, PicLeftOutlined, DeleteOutlined, FolderOutlined} from "@ant-design/icons-vue";
import MessageApi, {ChatMessage} from "../apis/MessageApi";
import FileApi from "../apis/FileApi";
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
        // 判断是否是文本或图片消息
        if (message.type === 'TEXT' || message.type === 'IMAGE' || message.type === 'FILE') {
          chatMsg.value.push(message)
          // 消息窗口滚动到底部
          scroll()
        }
      }
    })
// 判断是否有图片
const isHaveImage = ref(false)
// 打开文件窗口
const images = ref<HTMLElement>()
const triggerOpenImage = () => {
  if (images.value != undefined) {
    images.value.dispatchEvent(new MouseEvent('click'))
  }
}
// 解析图片
const imageView = ref()
const sendImage = function (e: Event) {
  const element = e.target as any
  if (element ?? false) {
    const image = element.files[0] as File | null
    if (image != null) {
      if (image.size > (1024 * 1024 * 10)) {
        message.warn('图片大小不能超过10M')
        message.error('已取消发送图片')
        return
      }
      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onloadend = () => {
        let base64 = reader.result
        imageView.value = base64 as string
        isHaveImage.value = true
      }
    }
  }
}
// 删除图片
const deleteImage = () => {
  imageView.value = ''
  isHaveImage.value = false
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
  let imagePromise
  if (isHaveImage.value) {
    imagePromise = MessageApi.sendImgMessage({
      target: {
        id: props.id,
      },
      imageBase64: imageView.value
    })
    imagePromise.then(() => {
      isHaveImage.value = false
      imageView.value = undefined
    })
  }
  // 所有信息发送完毕后
  let allPromise = []
  if (textPromise != undefined) {
    allPromise.push(textPromise)
  }
  if (imagePromise != undefined) {
    allPromise.push(imagePromise)
  }
  Promise.all(allPromise).then(() => {
    // 发送完毕后重新更新消息
    loadMag(props.id)
    //滚动到底部
    scroll()
  })
}
// 发送文件
const file = ref<HTMLElement>()
const isUpload = ref(false)
const fileProgress = ref<number>(0)
// ['active', 'exception']
const fileStatus = ref('active')
const triggerOpenFile = () => {
  if (file.value != undefined) {
    file.value.dispatchEvent(new MouseEvent('click'))
  }
}
const sendFile = (e: Event) => {
  const element = e.target as any
  const fileData = element.files[0] as File | null
  if (fileData == null) {
    // 若未选择文件，直接返回
    return
  }
  if (fileData.size > (1024 * 1024 * 100)) {
    message.warn('文件大小超过100M')
    message.error('已取消发送文件')
    return;
  }
  const formData = new FormData()
  formData.append('target', props.id)
  formData.append('file', fileData)
  // 显示文件上传进度条
  isUpload.value = true
  const p = setInterval(() => {
    if (isUpload.value && (fileProgress.value + 10 < 100)) {
      fileProgress.value += 1
    }
  }, 10)
  // 开始发送文件
  FileApi.uploadFile(formData).then(resp => {
    const {data} = resp
    if (data.code === 200) {
      loadMag(props.id)
      //滚动到底部
      scroll()
    }
  }).catch(() => {
    fileStatus.value = 'exception'
  }).finally(() => {
    // 处理上传追后的状态
    fileProgress.value = 100
    clearInterval(p)
    setTimeout(() => {
      fileProgress.value = 0
      isUpload.value = false
    }, 500)
  })
}
// 查看历史消息
const isOpenHistoryMessage = ref(false)
const disableScrolling = ref({
  overflow: 'auto',
})
const historyMessage = ref<ChatMessage[]>([])
const historyMessageQuery = reactive({
  page: 0,
  size: 1
})
const q = (page: number, size: number) => {
  console.log(page, size)
  if (Number.isInteger(page) && Number.isInteger(size)) {
    if (page >= 0 && size > 0) {
      MessageApi.loadFriendMessageById(props.id, page, size).then(resp => {
        if (resp.data.code === 200) {
          //加载消息数据
          historyMessage.value = resp.data.data.reverse() as ChatMessage[]
        } else if (resp.data.code === 405) {
          message.warn(resp.data.data)
        }
      })
    } else {
      message.warn('请输入合法的查询值')
    }
  }
}
watch(
    () => historyMessageQuery,
    () => {
      q(historyMessageQuery.page, historyMessageQuery.size)
    },
    {deep: true}
)
const openHistoryMessage = () => {
  isOpenHistoryMessage.value = true
  disableScrolling.value.overflow = 'hidden'
  q(historyMessageQuery.page, historyMessageQuery.size)
}
const onCloseHistoryMessage = () => {
  isOpenHistoryMessage.value = false
  disableScrolling.value.overflow = 'auto'
  //滚动到底部
  scroll()
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
      <div class="chat-message" :style="{position: 'relative', ...disableScrolling}" ref="chatBox">
        <template v-for="item in chatMsg" :key="item.id">
          <Bubble :item="item"></Bubble>
        </template>
        <a-drawer
            title="历史消息"
            width="600"
            placement="left"
            :closable="true"
            :visible="isOpenHistoryMessage"
            :get-container="false"
            :style="{ position: 'absolute' }"
            @close="onCloseHistoryMessage"
        >
          <a-empty v-if="historyMessage.length === 0" />
          <template v-else v-for="item in historyMessage" :key="item.id">
            <Bubble :item="item"></Bubble>
          </template>
          <template #footer>
            <a-input-group size="large">
              <a-row :gutter="8">
                <a-col :span="8">
                    <a-input addon-before="页数" v-model:value.number="historyMessageQuery.page" />
                </a-col>
                <a-col :span="8">
                    <a-input addon-before="条数" v-model:value.number="historyMessageQuery.size" />
                </a-col>
              </a-row>
            </a-input-group>
          </template>
        </a-drawer>
      </div>
      <div class="chat-tools">
        <input style="width: 0.1px;height: 0.1px" type="file" @change="sendImage" ref="images" accept="image/*"/>
        <a-tooltip title="发送图片">
          <a-button class="chat-tools-button" @click="triggerOpenImage" type="text">
            <template #icon>
              <picture-outlined/>
            </template>
          </a-button>
        </a-tooltip>
        <input style="width: 0.1px;height: 0.1px" type="file" @change="sendFile" ref="file" accept="*"/>
        <a-tooltip title="发送文件">
          <a-button @click="triggerOpenFile" class="chat-tools-button" type="text">
            <template #icon>
              <folder-outlined />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="删除图片">
          <a-button @click="deleteImage" class="chat-tools-button" type="text">
            <template #icon>
              <delete-outlined/>
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="查询历史消息">
          <a-button @click="openHistoryMessage" class="chat-tools-button" type="text">
            <template #icon>
              <pic-left-outlined />
            </template>
          </a-button>
        </a-tooltip>
        <div v-show="isUpload" class="tool-progress">
          <a-progress :percent="fileProgress" :status="fileStatus"/>
        </div>
      </div>
      <div class="chat-bottom">
        <div class="text-image-container">
          <img class="image-view" v-if="imageView" :src="imageView" alt="图片">
          <a-textarea
              v-model:value="sendMagVal"
              :auto-size="false"
              @keydown.enter="sendMessage"
          />
        </div>
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
    height: 74%;
    overflow: auto;
    scroll-margin-top: 0;
  }

  .chat-tools {
    position: relative;
    top: 0;
    left: 0;
    height: 6%;

    .chat-tools-button {
      height: 100%;
      width: 5%;
      margin-left: 10px;
    }

    .tool-progress {
      position: absolute;
      right: 10%;
      top: 50%;
      transform: translateY(-50%);
      width: 40%;
    }
  }

  .chat-bottom {
    position: relative;
    top: 0;
    left: 0;
    height: 20%;
    overflow: auto;

    .text-image-container {
      display: flex;
      justify-content: flex-start;
      height: 100%;

      textarea {
        height: inherit;
        resize: none;
      }

      .image-view {
        height: inherit;
        width: auto;
      }
    }

    button {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
}
</style>