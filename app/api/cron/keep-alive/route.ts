import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Perform a lightweight read query to keep Supabase Postgres and connection pooler active
    await prisma.user.findFirst({
      select: { id: true },
    })

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase keep-alive ping successful',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Keep-alive cron query failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database query failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
