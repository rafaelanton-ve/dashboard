<script setup>
import { useNotifications } from '@/lib/notifications'

const { notifications } = useNotifications()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="toast"
          :class="'toast-' + n.type"
        >
          <span class="toast-message">{{ n.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  min-width: 280px;
}

.toast-success {
  background: #065f46;
  color: #fff;
}

.toast-error {
  background: #991b1b;
  color: #fff;
}

.toast-warning {
  background: #92400e;
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 250ms ease-out;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
