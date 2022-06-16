<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view></router-view>
  </a-config-provider>
</template>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* 滚动槽 */
::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(55, 55, 55, 0.3);
}

::-webkit-scrollbar {
  width: 12px;
  height: 4px;
  background-color: #F5F5F5;
}
</style>
