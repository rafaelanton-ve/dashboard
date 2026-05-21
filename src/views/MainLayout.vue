<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantsStore } from '@/stores/tenants'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tenantsStore = useTenantsStore()

const sidebarOpen = ref(true)

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/tenants', label: 'Tenants', icon: 'users' },
  { path: '/settings', label: 'Configuración', icon: 'settings' }
]

const currentPath = computed(() => route.path)

function navigate(path) {
  router.push(path)
}

async function handleLogout() {
  await authStore.signOut()
  router.push('/login')
}

const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>`
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo" v-if="sidebarOpen">
          <span class="logo-icon">W</span>
          <span class="logo-text">Social Widget</span>
        </div>
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen" v-html="icons.menu"></button>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          :class="{ active: currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path)) }"
          @click="navigate(item.path)"
        >
          <span class="nav-icon" v-html="icons[item.icon]"></span>
          <span class="nav-label" v-if="sidebarOpen">{{ item.label }}</span>
        </button>
      </nav>
      
      <div class="sidebar-footer">
        <button class="nav-item logout" @click="handleLogout">
          <span class="nav-icon" v-html="icons.logout"></span>
          <span class="nav-label" v-if="sidebarOpen">Cerrar sesión</span>
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.menu-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.menu-toggle:hover {
  background: var(--color-background);
  color: var(--color-text);
}

.menu-toggle svg {
  width: 20px;
  height: 20px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: var(--color-background);
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-primary);
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--color-border);
}

.main-content {
  flex: 1;
  padding: 32px;
  background: var(--color-background);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .main-content {
    padding: 20px;
  }
}
</style>