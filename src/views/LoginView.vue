<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Por favor completa todos los campos'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    await authStore.signIn(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Social Widget</h1>
          <p>Dashboard Administrador</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="alert-error">
            {{ error }}
          </div>
          
          <div class="form-group">
            <label class="label">Correo electrónico</label>
            <input 
              v-model="email" 
              type="email" 
              class="input" 
              placeholder="admin@ejemplo.com"
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label class="label">Contraseña</label>
            <input 
              v-model="password" 
              type="password" 
              class="input" 
              placeholder="••••••••"
              :disabled="loading"
            />
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Iniciar sesión</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-form .btn {
  width: 100%;
  margin-top: 8px;
}

.alert-error {
  padding: 12px 16px;
  background: #fee2e2;
  border-radius: var(--radius-md);
  color: #991b1b;
  font-size: 14px;
}
</style>