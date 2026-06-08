import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createHash } from 'crypto'

function getIpHash(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? 'yugi-salt')).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { archetype } = await req.json()
    if (!archetype || typeof archetype !== 'string') {
      return NextResponse.json({ error: 'Invalid archetype' }, { status: 400 })
    }

    const ipHash = getIpHash(req)

    // Check if already voted
    const existing = await sql`SELECT archetype FROM votes WHERE ip_hash = ${ipHash}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'already_voted', votedFor: existing[0].archetype },
        { status: 409 }
      )
    }

    await sql`INSERT INTO votes (archetype, ip_hash) VALUES (${archetype}, ${ipHash})`

    return NextResponse.json({ success: true, archetype })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Check if current IP has voted
  const ipHash = getIpHash(req)
  const existing = await sql`SELECT archetype FROM votes WHERE ip_hash = ${ipHash}`
  if (existing.length > 0) {
    return NextResponse.json({ voted: true, archetype: existing[0].archetype })
  }
  return NextResponse.json({ voted: false })
}
