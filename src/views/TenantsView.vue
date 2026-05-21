<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTenantsStore } from '@/stores/tenants'
import { useNotifications } from '@/lib/notifications'

const router = useRouter()
const tenantsStore = useTenantsStore()
const { success, error } = useNotifications()

const showModal = ref(false)
const formData = ref({
  company_name: '',
  email: '',
  primary_color: '#000000',
  secondary_color: '#ffffff',
  accent_color: '#3b82f6',
  border_radius: 16,
  position: 'bottom-right',
  active: true
})

onMounted(() => {
  tenantsStore.fetchTenants()
})

function openCreateModal() {
  formData.value = {
    company_name: '',
    email: '',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#3b82f6',
    border_radius: 16,
    position: 'bottom-right',
    active: true
  }
  showModal.value = true
}

async function createTenant() {
  if (!formData.value.company_name?.trim()) {
    error('El nombre de la empresa es obligatorio')
    return
  }

  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    error('El email no es válido')
    return
  }

  try {
    await tenantsStore.createTenant(formData.value)
    showModal.value = false
    success('Tenant creado correctamente')
  } catch (err) {
    error('Error al crear el tenant')
  }
}

function viewTenant(id) {
  router.push(`/tenants/${id}`)
}
</script>

<template>
  <div class="tenants-page">
    <header class="page-header">
      <div>
        <h1>Tenants</h1>
        <p class="subtitle">Gestiona los clientes del sistema</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        + Nuevo Tenant
      </button>
    </header>

    <div class="card">
      <div v-if="tenantsStore.loading" class="loading">
        <span class="spinner"></span>
      </div>

      <table v-else-if="tenantsStore.tenants.length" class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Widget</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in tenantsStore.tenants" :key="tenant.id">
            <td>
              <strong>{{ tenant.company_name || 'Sin nombre' }}</strong>
            </td>
            <td>{{ tenant.email || '-' }}</td>
            <td>
              <code class="script-tag">
                &lt;script data-tenant="{{ tenant.id }}"&gt;&lt;/script&gt;
              </code>
            </td>
            <td>
              <span class="badge" :class="tenant.is_active ? 'badge-success' : 'badge-warning'">
                {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ new Date(tenant.created_at).toLocaleDateString('es-ES') }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="viewTenant(tenant.id)">
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <p>No hay tenants registrados</p>
        <button class="btn btn-accent" @click="openCreateModal">
          Crear primer tenant
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Nuevo Tenant</h3>
            <button class="close-btn" @click="showModal = false">×</button>
          </div>

          <form @submit.prevent="createTenant" class="tenant-form">
            <div class="form-row">
              <div class="form-group">
                <label class="label">Nombre de empresa</label>
                <input v-model="formData.company_name" type="text" class="input" required />
              </div>
              <div class="form-group">
                <label class="label">Email</label>
                <input v-model="formData.email" type="email" class="input" />
              </div>
            </div>

            <div class="form-row">
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
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Border radius</label>
                <input v-model.number="formData.border_radius" type="number" class="input" min="0" max="32" />
              </div>
              <div class="form-group">
                <label class="label">Posición</label>
                <select v-model="formData.position" class="input">
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="formData.active" type="checkbox" />
                <span>Activo</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="showModal = false">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="tenantsStore.loading">
                <span v-if="tenantsStore.loading" class="spinner"></span>
                <span v-else>Crear Tenant</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tenants-page {
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.script-tag {
  font-size: 11px;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  font-size: 24px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background: var(--color-background);
}

.tenant-form {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-row:has(.color-input) {
  grid-template-columns: repeat(3, 1fr);
}

.color-input {
  height: 44px;
  padding: 4px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
</style>
