import { NextResponse } from 'next/server'
import { sqlClient } from '@/db'
import { isDatabaseReady, initializeDatabase } from '@/lib/auto-init'

// Health check endpoint for load balancers and monitoring
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check if database is ready
    const ready = await isDatabaseReady()
    
    if (!ready) {
      // Try to auto-initialize
      console.log('[HEALTH] Database not ready, attempting auto-init...')
      await initializeDatabase()
    }
    
    // Test database connection with a simple query
    await sqlClient`SELECT 1 as test`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'connected',
        tablesReady: ready ? 'yes' : 'initialized'
      }
    }, { status: 200 })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 503 })
  }
}
