import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Importar Supabase de forma segura
    const { supabaseAdmin } = await import('@/lib/supabase')
    console.log('Supabase imported successfully')
    
    // Probar conexión simple
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('Supabase query result:', { data, error })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase error',
        details: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      result: data
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Import or connection error',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
