import { createClient } from './supabase-client'

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function signIn(email, password) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function updateQRCode(id, updates) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('qrcodes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error }
}

export function generateShortCode() {
  return Math.random().toString(36).substring(2, 8)
}