<script setup lang="ts">
import {ChatMessage} from "../apis/MessageApi";
import {useUserStore} from "../store/UserStore";
import {reactive} from "vue";

const props = defineProps<{
  item: ChatMessage
}>()

const userStore = useUserStore()

const isReversal = reactive({
  'mirror-reversal': false
})
if (props.item.from.id === userStore.user.id) {
  isReversal["mirror-reversal"] = true
}
</script>

<script lang="ts">
export default {
  name: "Bubble"
}
</script>

<template>
  <a-comment :class="isReversal">
    <template #author>{{ item.from.name }}</template>
    <template #avatar>
      <a-avatar src="https://joeschmoe.io/api/v1/random" alt="头像"/>
    </template>
    <template #content>
      <img class="bubble-img" :src="item.imageBase64" alt="" v-if="item.type === 'IMAGE'">
      <p class="bubble-text" v-else-if="item.type === 'TEXT'">
        {{ item.text }}
      </p>
    </template>
    <template #datetime>
      <span>{{ item.date }}</span>
    </template>
  </a-comment>
</template>

<style scoped lang="scss">
.mirror-reversal {
  :deep(.ant-comment-inner) {

    .ant-comment-avatar {
      order: 2;
      margin-right: 0;
      margin-left: 12px;
    }

    .ant-comment-content {
      text-align: right;

      .ant-comment-content-author {
        justify-content: flex-end;

        .ant-comment-content-author-name {
          order: 2;
        }
      }
    }
  }
}

.bubble-img {
  width: 200px;
  height: 200px;
}

.bubble-text {
  font-size: x-large;
}
</style>