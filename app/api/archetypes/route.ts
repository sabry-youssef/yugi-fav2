import { NextResponse } from 'next/server'

export const revalidate = 86400 // cache 24h

export async function GET() {
  try {
    const res = await fetch('https://db.ygoprodeck.com/api/v7/archetypes.php', {
      next: { revalidate: 86400 },
    })
    if (!res.ok) throw new Error('YGOProDeck API error')
    const data = await res.json()
    // data is an array of { archetype_name: string }
    const archetypes: string[] = data.map((a: { archetype_name: string }) => a.archetype_name).sort()
    return NextResponse.json({ archetypes })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch archetypes' }, { status: 500 })
  }
}
