import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useTenantsStore = defineStore('tenants', () => {
  const tenants = ref([])
  const currentTenant = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const tenantCount = computed(() => tenants.value.length)

  async function fetchTenants() {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (err) {
      error.value = err.message
      loading.value = false
      return
    }
    
    tenants.value = data || []
    loading.value = false
  }

  async function fetchTenantById(id) {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()
    
    if (err) {
      error.value = err.message
      loading.value = false
      return
    }
    
    currentTenant.value = data
    loading.value = false
    return data
  }

  async function createTenant(tenantData) {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await supabase
      .from('tenants')
      .insert([tenantData])
      .select()
      .single()
    
    if (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
    
    tenants.value.unshift(data)
    loading.value = false
    return data
  }

  async function updateTenant(id, updates) {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
    
    const index = tenants.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tenants.value[index] = data
    }
    
    if (currentTenant.value?.id === id) {
      currentTenant.value = data
    }
    
    loading.value = false
    return data
  }

  async function deleteTenant(id) {
    loading.value = true
    error.value = null
    
    const { error: err } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id)
    
    if (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
    
    tenants.value = tenants.value.filter(t => t.id !== id)
    
    if (currentTenant.value?.id === id) {
      currentTenant.value = null
    }
    
    loading.value = false
  }

  function clearCurrentTenant() {
    currentTenant.value = null
  }

  return {
    tenants,
    currentTenant,
    loading,
    error,
    tenantCount,
    fetchTenants,
    fetchTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
    clearCurrentTenant
  }
})