<script setup>
import { onMounted, computed } from 'vue'
import { useTenantsStore } from '@/stores/tenants'
import { useAuthStore } from '@/stores/auth'

const tenantsStore = useTenantsStore()
const authStore = useAuthStore()

onMounted(() => {
  tenantsStore.fetchTenants()
})

const stats = computed(() => [
  {
    label: 'Total Tenants',
    value: tenantsStore.tenantCount,
    icon: 'users',
    color: '#3b82f6'
  },
  {
    label: 'Activos',
    value: tenantsStore.tenants.filter(t => t.is_active).length,
    icon: 'check',
    color: '#10b981'
  },
  {
    label: 'Inactivos',
    value: tenantsStore.tenants.filter(t => !t.is_active).length,
    icon: 'pause',
    color: '#f59e0b'
  }
])

const recentTenants = computed(() => tenantsStore.tenants.slice(0, 5))

const icons = {
  users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>`
}
</script>

<template>
  <div class="dashboard">
    <header class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">Bienvenido, {{ authStore.user?.email }}</p>
      </div>
    </header>
    
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.color + '15', color: stat.color }">
          <span v-html="icons[stat.icon]"></span>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>Tenants Recientes</h2>
        <router-link to="/tenants" class="btn btn-secondary btn-sm">
          Ver todos <span v-html="icons.arrow"></span>
        </router-link>
      </div>
      
      <div class="card">
        <div v-if="tenantsStore.loading" class="loading">
          <span class="spinner"></span>
        </div>
        
        <table v-else-if="recentTenants.length" class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>ID</th>
              <th>Estado</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in recentTenants" :key="tenant.id">
              <td>{{ tenant.company_name || 'Sin nombre' }}</td>
              <td>
                <code>{{ tenant.id.slice(0, 8) }}...</code>
              </td>
              <td>
                <span class="badge" :class="tenant.is_active ? 'badge-success' : 'badge-warning'">
                  {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ new Date(tenant.created_at).toLocaleDateString('es-ES') }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="empty-state">
          <p>No hay tenants registrados</p>
          <router-link to="/tenants" class="btn btn-accent">
            Crear primer tenant
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.section-header .btn svg {
  width: 16px;
  height: 16px;
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

code {
  font-size: 12px;
  background: var(--color-background);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>