import { createClient } from '@supabase/supabase-js'

// CREDENCIALES HARDCODEADAS - FUNCIONANDO
const supabaseUrl = 'https://ohhzkddjytbwyuxamyaf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaHprZGRqeXRid3l1eGFteWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjYzMDMsImV4cCI6MjA3MTEwMjMwM30.fKhdpttsn7cvqNW1UUiNgU1uKz5WyAYHadJTmwJaXa0'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaHprZGRqeXRid3l1eGFteWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUyNjMwMywiZXhwIjoyMDcxMTAyMzAzfQ.LSGSkXTST7iQZ58brwD-4RKI1XwbpAAJvb_K7bOtfGU'

// Cliente público (para el frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente con service role (para operaciones admin en el backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
// Deploy trigger Sat Aug 23 19:32:34 CEST 2025
