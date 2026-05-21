<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenantsStore } from '@/stores/tenants'
import { useNotifications } from '@/lib/notifications'

const route = useRoute()
const router = useRouter()
const tenantsStore = useTenantsStore()
const { success, error } = useNotifications()

const activeTab = ref('config')
const saving = ref(false)
const previewOpen = ref(false)

const formData = ref({
  company_name: '',
  email: '',
  description: '',
  primary_color: '#000000',
  secondary_color: '#ffffff',
  accent_color: '#3b82f6',
  border_radius: 16,
  position: 'bottom-right',
  logo: '',
  social_links: [],
  secondary_links: [],
  active: true
})

const socialPlatforms = [
  { name: 'WhatsApp', icon: 'whatsapp', placeholder: 'https://wa.me/123456789' },
  { name: 'Instagram', icon: 'instagram', placeholder: 'https://instagram.com/username' },
  { name: 'Facebook', icon: 'facebook', placeholder: 'https://facebook.com/page' },
  { name: 'TikTok', icon: 'tiktok', placeholder: 'https://tiktok.com/@username' },
  { name: 'YouTube', icon: 'youtube', placeholder: 'https://youtube.com/@channel' },
  { name: 'LinkedIn', icon: 'linkedin', placeholder: 'https://linkedin.com/company/name' },
  { name: 'Twitter', icon: 'twitter', placeholder: 'https://twitter.com/username' }
]

const secondaryLinkTypes = [
  { name: 'Sitio web', icon: 'globe' },
  { name: 'Correo', icon: 'mail' },
  { name: 'Ubicación', icon: 'location' }
]

onMounted(async () => {
  const tenant = await tenantsStore.fetchTenantById(route.params.id)
  if (tenant) {
    formData.value = {
      ...tenant,
      social_links: tenant.social_links || [],
      secondary_links: tenant.secondary_links || []
    }
  }
})

onUnmounted(() => {
  tenantsStore.clearCurrentTenant()
})

function isValidUrl(str) {
  if (!str) return true
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function isValidEmail(str) {
  if (!str) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

async function saveTenant() {
  if (!formData.value.company_name?.trim()) {
    error('El nombre de la empresa es obligatorio')
    return
  }

  if (formData.value.email && !isValidEmail(formData.value.email)) {
    error('El email de contacto no es válido')
    return
  }

  if (formData.value.logo && !isValidUrl(formData.value.logo)) {
    error('La URL del logo no es válida')
    return
  }

  for (const link of formData.value.social_links) {
    if (link.url && !isValidUrl(link.url)) {
      error(`La URL de ${link.name || 'red social'} no es válida`)
      return
    }
  }

  for (const link of formData.value.secondary_links) {
    if (link.url && !isValidUrl(link.url)) {
      error(`La URL de ${link.name || 'enlace secundario'} no es válida`)
      return
    }
  }

  saving.value = true
  try {
    await tenantsStore.updateTenant(route.params.id, formData.value)
    success('Cambios guardados correctamente')
  } catch (err) {
    error('Error al guardar los cambios')
  } finally {
    saving.value = false
  }
}

async function deleteTenant() {
  if (!confirm('¿Estás seguro de eliminar este tenant? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    await tenantsStore.deleteTenant(route.params.id)
    success('Tenant eliminado correctamente')
    router.push('/tenants')
  } catch (err) {
    error('Error al eliminar el tenant')
  }
}

function addSocialLink() {
  formData.value.social_links.push({ name: '', url: '', icon: '' })
}

function removeSocialLink(index) {
  formData.value.social_links.splice(index, 1)
}

function addSecondaryLink() {
  formData.value.secondary_links.push({ name: '', url: '', icon: 'globe' })
}

function removeSecondaryLink(index) {
  formData.value.secondary_links.splice(index, 1)
}

const tabs = [
  { id: 'config', label: 'Configuración' },
  { id: 'links', label: 'Enlaces' },
  { id: 'preview', label: 'Vista Previa' }
]

const copyScript = computed(() =>
  `<script data-tenant="${route.params.id}" src="https://widget.tudominio.com/widget.js"><\/script>`
)

async function copyInstallScript() {
  try {
    await navigator.clipboard.writeText(copyScript.value)
    success('Script copiado al portapapeles')
  } catch {
    error('No se pudo copiar el script')
  }
}
</script>

<template>
  <div class="tenant-detail">
    <header class="page-header">
      <div>
        <button class="back-btn" @click="router.push('/tenants')">
          ← Volver
        </button>
        <h1>{{ formData.company_name || 'Editar Tenant' }}</h1>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="previewOpen = true">
          Vista Previa
        </button>
        <button class="btn btn-primary" @click="saveTenant" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Guardar cambios</span>
        </button>
      </div>
    </header>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'config'" class="config-tab">
        <div class="card">
          <h3>Información básica</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="label">Nombre de empresa</label>
              <input v-model="formData.company_name" type="text" class="input" />
            </div>
            <div class="form-group">
              <label class="label">Email de contacto</label>
              <input v-model="formData.email" type="email" class="input" />
            </div>
            <div class="form-group full-width">
              <label class="label">Descripción</label>
              <textarea v-model="formData.description" class="input" rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label class="label">URL del logo</label>
              <input v-model="formData.logo" type="url" class="input" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Personalización visual</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="label">Color primario</label>
              <input v-model="formData.primary_color" type="color" class="input color-input" />
            </div>
            <div class="form-group">
              <label class="label">Color secundario</label>
              <input v-model="formData.secondary_color" type="color" class="input color-input" />
            </div>
            <div class="form-group">
              <label class="label">Color acento</label>
              <input v-model="formData.accent_color" type="color" class="input color-input" />
            </div>
            <div class="form-group">
              <label class="label">Border radius</label>
              <input v-model.number="formData.border_radius" type="number" class="input" min="0" max="32" />
            </div>
            <div class="form-group">
              <label class="label">Posición del widget</label>
              <select v-model="formData.position" class="input">
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="formData.active" type="checkbox" />
                <span>Widget activo</span>
              </label>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Script de instalación</h3>
          <div class="script-box">
            <code>{{ copyScript }}</code>
            <button class="btn btn-sm btn-secondary" @click="copyInstallScript">
              Copiar
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'links'" class="links-tab">
        <div class="card">
          <div class="card-header">
            <h3>Redes sociales</h3>
            <button class="btn btn-sm btn-secondary" @click="addSocialLink">
              + Agregar
            </button>
          </div>

          <div v-if="formData.social_links.length" class="links-list">
            <div v-for="(link, index) in formData.social_links" :key="index" class="link-item">
              <select v-model="link.name" class="input">
                <option value="">Seleccionar plataforma</option>
                <option v-for="p in socialPlatforms" :key="p.name" :value="p.name">
                  {{ p.name }}
                </option>
              </select>
              <input v-model="link.url" type="url" class="input" placeholder="URL" />
              <button class="btn btn-ghost btn-sm" @click="removeSocialLink(index)">×</button>
            </div>
          </div>
          <p v-else class="empty-text">No hay redes sociales configuradas</p>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Enlaces secundarios</h3>
            <button class="btn btn-sm btn-secondary" @click="addSecondaryLink">
              + Agregar
            </button>
          </div>

          <div v-if="formData.secondary_links.length" class="links-list">
            <div v-for="(link, index) in formData.secondary_links" :key="index" class="link-item">
              <select v-model="link.name" class="input">
                <option value="">Seleccionar tipo</option>
                <option v-for="t in secondaryLinkTypes" :key="t.name" :value="t.name">
                  {{ t.name }}
                </option>
              </select>
              <input v-model="link.url" type="url" class="input" placeholder="URL" />
              <button class="btn btn-ghost btn-sm" @click="removeSecondaryLink(index)">×</button>
            </div>
          </div>
          <p v-else class="empty-text">No hay enlaces secundarios</p>
        </div>

        <div class="card danger-zone">
          <h3>Zona de peligro</h3>
          <p>Esta acción eliminará permanentemente el tenant y todos sus datos.</p>
          <button class="btn btn-danger" @click="deleteTenant">
            Eliminar Tenant
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'preview'" class="preview-tab">
        <div class="preview-container">
          <div class="preview-info">
            <p>Esta es una vista previa de cómo se verá el widget en un sitio web.</p>
          </div>
          <div class="preview-widget" :style="{
            '--primary': formData.primary_color,
            '--secondary': formData.secondary_color,
            '--accent': formData.accent_color,
            '--radius': formData.borderRadius + 'px'
          }">
            <div class="preview-button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tenant-detail {
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.back-btn:hover {
  color: var(--color-text);
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--transition-fast);
}

.tab:hover {
  color: var(--color-text);
}

.tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.tab-content .card {
  margin-bottom: 20px;
}

.tab-content .card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.color-input {
  height: 44px;
  padding: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 28px;
}

.script-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: var(--radius-md);
}

.script-box code {
  flex: 1;
  font-size: 12px;
  word-break: break-all;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h3 {
  margin-bottom: 0;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  gap: 12px;
}

.link-item .input:first-child {
  width: 160px;
}

.link-item .input:nth-child(2) {
  flex: 1;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 14px;
}

.danger-zone {
  border-color: #fecaca;
  background: #fef2f2;
}

.danger-zone h3 {
  color: #991b1b;
}

.danger-zone p {
  color: #7f1d1d;
  font-size: 14px;
  margin-bottom: 16px;
}

.preview-tab {
  padding: 40px 0;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.preview-info {
  text-align: center;
  color: var(--color-text-muted);
}

.preview-widget {
  position: relative;
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 20px;
}

.preview-button {
  width: 60px;
  height: 60px;
  border-radius: var(--radius, 16px);
  background: var(--primary);
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.preview-button svg {
  width: 28px;
  height: 28px;
}
</style>
