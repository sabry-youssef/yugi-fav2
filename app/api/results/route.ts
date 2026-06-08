import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const revalidate = 60 // refresh every 60s

export async function GET() {
  try {
    const [totals, archetypeCount] = await Promise.all([
      sql`
        SELECT archetype, COUNT(*) as votes
        FROM votes
        GROUP BY archetype
        ORDER BY votes DESC, archetype ASC

      `,
      sql`SELECT COUNT(DISTINCT archetype) as count FROM votes`,
    ])

    const totalVotes = await sql`SELECT COUNT(*) as count FROM votes`

    return NextResponse.json({
      leaderboard: totals.map(row => ({
        archetype: row.archetype,
        votes: Number(row.votes),
      })),
      stats: {
        totalVotes: Number(totalVotes[0].count),
        uniqueArchetypes: Number(archetypeCount[0].count),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
