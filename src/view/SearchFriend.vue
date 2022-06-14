<script setup lang="ts">
import {reactive, ref} from "vue";
import FriendApi, {Account} from "../apis/FriendApi";
import {PlusOutlined} from "@ant-design/icons-vue";
import MessageApi from "../apis/MessageApi";
import {message} from "ant-design-vue";

// 返回查找的数据

// 查找好友
const accountId = ref('')
const accounts = ref<Account[]>([])
const search = () => {
  // 校验
  const pattern = /[0-9]+/g
  if (pattern.test(accountId.value)) {
    const account: Account = {
      username: accountId.value,
      name: '',
      phone: '',
      age: ''
    }
    FriendApi.searchFriend(account).then(resp => {
      const data = resp.data
      if (data.code === 200) {
        accounts.value = data.data
      }
    })
  }
}
// 添加好友
const addFriend = async (id: number) => {
  const resp = await MessageApi.sendAddFriendMessage(id)
  const {data} = resp
  if (data.code === 200) {
    message.info(data.data.message)
  } else {
    message.warn(data.data.message)
  }
}
</script>

<script lang="ts">
export default {
  name: "SearchFriend"
}
</script>

<template>
  <a-list item-layout="horizontal" :data-source="accounts" :locale="{emptyText: ''}">
    <template #header>
      <a-input-search
          v-model:value="accountId"
          placeholder="请输入用户账号"
          enter-button
          @search="search"
      />
    </template>
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta>
          <template #description>
            <div class="align-both-ends">
              <span>{{ item.name }}</span>
              <a-button
                  type="primary"
                  shape="round"
                  size="small"
                  style="margin-right: 10px"
                  @click="addFriend(item.id)"
              >
                <template #icon>
                  <plus-outlined />
                </template>
              </a-button>
            </div>
          </template>
          <template #title>
            <span>{{ item.username }}</span>
          </template>
          <template #avatar>
            <a-avatar src="https://joeschmoe.io/api/v1/random"/>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
</template>

<style scoped lang="scss">
.align-both-ends {
  display: flex;
  justify-content: space-between;
}
</style>