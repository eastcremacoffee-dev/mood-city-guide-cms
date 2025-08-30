import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ohhzkddjytbwyuxamyaf.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaHprZGRqeXRid3l1eGFteWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUyNjMwMywiZXhwIjoyMDcxMTAyMzAzfQ.LSGSkXTST7iQZ58brwD-4RKI1XwbpAAJvb_K7bOtfGU'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando base de datos...')
    
    // Usar service role key para operaciones administrativas
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Ejecutar los comandos SQL uno por uno
    const sqlCommands = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id VARCHAR(255);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_type VARCHAR(100);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;',
      'CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id);'
    ]

    const results = []
    
    for (const sql of sqlCommands) {
      console.log(`Ejecutando: ${sql}`)
      const { data, error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        console.error(`Error ejecutando ${sql}:`, error)
        // Continuar con el siguiente comando aunque falle uno
        results.push({ sql, error: error.message, success: false })
      } else {
        console.log(`✅ Ejecutado: ${sql}`)
        results.push({ sql, success: true })
      }
    }

    // Verificar estructura final
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .order('ordinal_position')

    if (columnsError) {
      console.error('Error obteniendo columnas:', columnsError)
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de base de datos completada',
      results,
      columns: columns || []
    })

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
