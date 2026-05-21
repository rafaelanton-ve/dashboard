<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NotificationToast from '@/components/NotificationToast.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <NotificationToast />
</template>

<style>
#app {
  min-height: 100vh;
}
</style>