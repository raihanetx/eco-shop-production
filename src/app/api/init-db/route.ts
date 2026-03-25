import { NextResponse } from 'next/server'
import { initializeDatabase, isDatabaseReady } from '@/lib/auto-init'

/**
 * POST /api/init-db
 * Manually trigger database initialization
 * This is also called automatically on server startup
 */
export async function POST() {
  try {
    console.log('[INIT-DB] Manual initialization requested...')
    
    const result = await initializeDatabase()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[INIT-DB] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize database'
    }, { status: 500 })
  }
}

/**
 * GET /api/init-db
 * Check if database is initialized
 */
export async function GET() {
  try {
    const ready = await isDatabaseReady()
    
    if (ready) {
      return NextResponse.json({
        initialized: true,
        message: 'Database is ready'
      })
    } else {
      return NextResponse.json({
        initialized: false,
        message: 'Database tables not found. Call POST /api/init-db to initialize.'
      })
    }
  } catch (error) {
    return NextResponse.json({
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
