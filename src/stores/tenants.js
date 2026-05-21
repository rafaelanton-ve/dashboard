import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const TENANT_COLUMNS = [
  'company_name', 'email', 'description', 'logo',
  'primary_color', 'secondary_color', 'accent_color',
  'border_radius', 'position', 'is_active', 'plan',
  'monthly_clicks', 'clicks_limit', 'slug'
]

function toTenantPayload(data) {
  const payload = {}
  for (const col of TENANT_COLUMNS) {
    if (data[col] !== undefined) payload[col] = data[col]
  }
  if (data.active !== undefined && payload.is_active === undefined) {
    payload.is_active = data.active
  }
  return payload
}

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
    
    const { data: socialLinks, error: socialErr } = await supabase
      .from('social_links')
      .select('*')
      .eq('tenant_id', id)
      .order('sort_order', { ascending: true })
    
    if (socialErr) {
      error.value = socialErr.message
      loading.value = false
      return
    }
    
    const { data: secondaryLinks, error: secondaryErr } = await supabase
      .from('secondary_links')
      .select('*')
      .eq('tenant_id', id)
      .order('sort_order', { ascending: true })
    
    if (secondaryErr) {
      error.value = secondaryErr.message
      loading.value = false
      return
    }
    
    currentTenant.value = {
      ...data,
      social_links: socialLinks || [],
      secondary_links: secondaryLinks || []
    }
    loading.value = false
    return currentTenant.value
  }

  async function createTenant(tenantData) {
    loading.value = true
    error.value = null
    
    const { data, error: err } = await supabase
      .from('tenants')
      .insert([toTenantPayload(tenantData)])
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
      .update(toTenantPayload(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
    
    const { data: socialLinks } = await supabase
      .from('social_links')
      .select('id')
      .eq('tenant_id', id)
    
    if (socialLinks?.length) {
      await supabase
        .from('social_links')
        .delete()
        .eq('tenant_id', id)
    }
    
    const links = updates.social_links || []
    if (links.length) {
      const socialPayload = links.map((link, i) => ({
        tenant_id: id,
        platform: link.name || link.platform || '',
        url: link.url || '',
        label: link.label || link.name || '',
        icon: link.icon || '',
        sort_order: i,
        is_visible: true
      }))
      
      const { error: insertSocialErr } = await supabase
        .from('social_links')
        .insert(socialPayload)
      
      if (insertSocialErr) {
        error.value = insertSocialErr.message
        loading.value = false
        throw insertSocialErr
      }
    }
    
    const { data: secondaryData } = await supabase
      .from('secondary_links')
      .select('id')
      .eq('tenant_id', id)
    
    if (secondaryData?.length) {
      await supabase
        .from('secondary_links')
        .delete()
        .eq('tenant_id', id)
    }
    
    const secLinks = updates.secondary_links || []
    if (secLinks.length) {
      const secPayload = secLinks.map((link, i) => ({
        tenant_id: id,
        label: link.name || link.label || '',
        url: link.url || '',
        icon: link.icon || 'globe',
        sort_order: i,
        is_visible: true
      }))
      
      const { error: insertSecErr } = await supabase
        .from('secondary_links')
        .insert(secPayload)
      
      if (insertSecErr) {
        error.value = insertSecErr.message
        loading.value = false
        throw insertSecErr
      }
    }
    
    const index = tenants.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tenants.value[index] = data
    }
    
    if (currentTenant.value?.id === id) {
      currentTenant.value = {
        ...data,
        social_links: links,
        secondary_links: secLinks
      }
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