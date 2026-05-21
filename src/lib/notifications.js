import { ref } from 'vue'

const notifications = ref([])
let id = 0

export function useNotifications() {
  function notify(message, type = 'success', duration = 4000) {
    const notification = { id: ++id, message, type }
    notifications.value.push(notification)
    setTimeout(() => {
      const index = notifications.value.findIndex(n => n.id === notification.id)
      if (index !== -1) notifications.value.splice(index, 1)
    }, duration)
  }

  function success(msg) { notify(msg, 'success') }
  function error(msg) { notify(msg, 'error', 6000) }
  function warning(msg) { notify(msg, 'warning', 5000) }

  return { notifications, notify, success, error, warning }
}
