import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const isAdmin = ref(false)
  let sessionTimer = null

  const isAuthenticated = computed(() => !!user.value)

  function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer)
    if (user.value) {
      sessionTimer = setTimeout(() => {
        signOut()
      }, SESSION_TIMEOUT_MS)
    }
  }

  function setupActivityListener() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetSessionTimer, { passive: true })
    })
  }

  async function initialize() {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      user.value = session.user
      await checkAdminStatus()
      resetSessionTimer()
      setupActivityListener()
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user || null
      if (session?.user) {
        await checkAdminStatus()
        resetSessionTimer()
        setupActivityListener()
      } else {
        isAdmin.value = false
        if (sessionTimer) clearTimeout(sessionTimer)
      }
      loading.value = false
    })

    loading.value = false
  }

  async function checkAdminStatus() {
    if (!user.value) {
      isAdmin.value = false
      return
    }

    const { data: admins, error: countError } = await supabase
      .from('admins')
      .select('id')
      .limit(1)

    const isFirstAdmin = !countError && (!admins || admins.length === 0)

    if (isFirstAdmin) {
      isAdmin.value = true
      return
    }

    const { data, error } = await supabase
      .from('admins')
      .select('id, role, is_active')
      .eq('user_id', user.value.id)
      .eq('is_active', true)
      .single()

    isAdmin.value = !!data && !error
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales inválidas')
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email no confirmado. Revisa tu bandeja de entrada')
      }
      if (error.message.includes('rate_limit')) {
        throw new Error('Demasiados intentos. Intenta de nuevo más tarde')
      }
      throw new Error('Error al iniciar sesión. Intenta de nuevo')
    }

    user.value = data.user
    resetSessionTimer()
    setupActivityListener()

    const { data: admins, error: countError } = await supabase
      .from('admins')
      .select('id')
      .limit(1)

    const isFirstAdmin = !countError && (!admins || admins.length === 0)

    if (isFirstAdmin) {
      await supabase.from('admins').insert({
        user_id: data.user.id,
        email: data.user.email,
        name: 'Admin Principal',
        role: 'superadmin',
        is_active: true
      })
      isAdmin.value = true
    } else {
      await checkAdminStatus()
      if (!isAdmin.value) {
        await supabase.auth.signOut()
        user.value = null
        throw new Error('No tienes acceso al dashboard')
      }
    }

    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    isAdmin.value = false
    if (sessionTimer) clearTimeout(sessionTimer)
  }

  async function getAdmins() {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async function addAdmin(email, name, role = 'admin') {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
    const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/add-admin`

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No autenticado')

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ email, name, role })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al crear el administrador')
    }

    return response.json()
  }

  async function updateAdminStatus(adminId, isActive) {
    const { data, error } = await supabase
      .from('admins')
      .update({ is_active: isActive })
      .eq('id', adminId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function removeAdmin(adminId) {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', adminId)

    if (error) throw error
  }

  return {
    user,
    loading,
    isAdmin,
    isAuthenticated,
    initialize,
    signIn,
    signOut,
    checkAdminStatus,
    getAdmins,
    addAdmin,
    updateAdminStatus,
    removeAdmin
  }
})
