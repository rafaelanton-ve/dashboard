<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/lib/notifications'

const authStore = useAuthStore()
const { success } = useNotifications()

const widgetUrl = ref(import.meta.env.VITE_WIDGET_URL || 'https://widget.tudominio.com/widget.js')
const saving = ref(false)

async function saveSettings() {
  saving.value = true
  await new Promise(r => setTimeout(r, 1000))
  saving.value = false
  success('Configuración guardada')
}

function handleLogout() {
  authStore.signOut()
}
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h1>Configuración</h1>
      <p class="subtitle">Ajustes generales del sistema</p>
    </header>

    <div class="settings-grid">
      <div class="card">
        <h3>Cuenta</h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Email</span>
            <span class="setting-value">{{ authStore.user?.email }}</span>
          </div>
        </div>
        <button class="btn btn-secondary" @click="handleLogout">
          Cerrar sesión
        </button>
      </div>

      <div class="card">
        <h3>Integraciones</h3>
        <div class="form-group">
          <label class="label">URL del widget</label>
          <input v-model="widgetUrl" type="url" class="input" />
          <p class="help-text">Esta URL se usa en el script de instalación de los tenants</p>
        </div>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Guardar</span>
        </button>
      </div>

      <div class="card">
        <h3>Acerca de</h3>
        <div class="about-info">
          <p><strong>Social Widget</strong></p>
          <p>Versión 1.0.0</p>
          <p class="muted">Plataforma SaaS multi-tenant para widgets flotantes de redes sociales</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 800px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text);
}

.setting-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.setting-value {
  font-size: 14px;
  color: var(--color-text);
}

.help-text {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

.about-info {
  font-size: 14px;
  line-height: 1.8;
}

.about-info p {
  margin: 0;
}

.about-info .muted {
  color: var(--color-text-muted);
  margin-top: 8px;
}

.settings-grid .btn {
  margin-top: 16px;
}
</style>
