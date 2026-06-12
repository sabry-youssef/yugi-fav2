'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ARCHETYPE_GROUPS, type ArchetypeGroup } from '@/lib/groups'
import styles from './leaderboard.module.css'

type Entry = { archetype: string; votes: number }
type Stats = { totalVotes: number; uniqueArchetypes: number }

type DisplayEntry =
  | { kind: 'single'; archetype: string; votes: number }
  | { kind: 'group'; label: string; totalVotes: number; members: Entry[] }

function buildDisplay(data: Entry[]): DisplayEntry[] {
  const consumed = new Set<string>()
  const display: DisplayEntry[] = []

  // Index votes by archetype name
  const voteMap = new Map(data.map(e => [e.archetype, e.votes]))

  for (const group of ARCHETYPE_GROUPS) {
    const members: Entry[] = group.members
      .filter(m => voteMap.has(m))
      .map(m => ({ archetype: m, votes: voteMap.get(m)! }))
      .sort((a, b) => b.votes - a.votes)

    if (members.length >= 2) {
      members.forEach(m => consumed.add(m.archetype))
      const totalVotes = members.reduce((s, m) => s + m.votes, 0)
      display.push({ kind: 'group', label: group.label, totalVotes, members })
    }
  }

  // Add ungrouped archetypes
  for (const entry of data) {
    if (!consumed.has(entry.archetype)) {
      display.push({ kind: 'single', archetype: entry.archetype, votes: entry.votes })
    }
  }

  // Sort everything by votes descending
  display.sort((a, b) => {
    const va = a.kind === 'group' ? a.totalVotes : a.votes
    const vb = b.kind === 'group' ? b.totalVotes : b.votes
    return vb - va
  })

  return display
}

export default function Leaderboard() {
  const [data, setData] = useState<Entry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(d => {
        setData(d.leaderboard ?? [])
        setStats(d.stats ?? null)
        setLoading(false)
      })
  }, [])

  const display = buildDisplay(data)
  const maxVotes = display.reduce((m, e) => Math.max(m, e.kind === 'group' ? e.totalVotes : e.votes), 0)

  function toggleGroup(label: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingGlyph}>⚖</div>
        <p>Counting souls…</p>
      </div>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.back}>← Vote</Link>
          <div className={styles.eyebrow}>The results</div>
          <h1 className={styles.title}>Leaderboard</h1>
          {stats && (
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{stats.totalVotes.toLocaleString('en-US')}</div>
                <div className={styles.statLabel}>total votes</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{stats.uniqueArchetypes}</div>
                <div className={styles.statLabel}>archetypes represented</div>
              </div>
            </div>
          )}
        </header>

        {display.length === 0 ? (
          <div className={styles.empty}>
            <p>No votes yet.</p>
            <Link href="/" className={styles.voteLink}>Be the first →</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {display.map((entry, i) => {
              const votes = entry.kind === 'group' ? entry.totalVotes : entry.votes
              const trueRank = display.filter(e => (e.kind === 'group' ? e.totalVotes : e.votes) > votes).length + 1
              const rankClass = trueRank <= 3 ? styles[`rank${trueRank}` as keyof typeof styles] : ''

              if (entry.kind === 'group') {
                const isOpen = expanded.has(entry.label)
                return (
                  <div key={entry.label} className={styles.groupWrapper}>
                    <button
                      className={`${styles.row} ${styles.groupRow} ${rankClass ?? ''}`}
                      onClick={() => toggleGroup(entry.label)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.rank}>{trueRank}</div>
                      <div className={styles.name}>
                        <span className={styles.groupIcon}>{isOpen ? '▾' : '▸'}</span>
                        {entry.label}
                        <span className={styles.groupBadge}>{entry.members.length} archetypes</span>
                      </div>
                      <div className={styles.barWrap}>
                        <div className={styles.bar} style={{ width: `${(entry.totalVotes / maxVotes) * 100}%` }} />
                      </div>
                      <div className={styles.count}>
                        {entry.totalVotes} <span className={styles.countLabel}>fans</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className={styles.subList}>
                        {entry.members.map(m => (
                          <div key={m.archetype} className={styles.subRow}>
                            <div className={styles.subName}>{m.archetype}</div>
                            <div className={styles.subBarWrap}>
                              <div className={styles.subBar} style={{ width: `${(m.votes / entry.totalVotes) * 100}%` }} />
                            </div>
                            <div className={styles.subCount}>
                              {m.votes} <span className={styles.countLabel}>{m.votes === 1 ? 'fan' : 'fans'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div key={entry.archetype} className={`${styles.row} ${rankClass ?? ''}`}>
                  <div className={styles.rank}>{trueRank}</div>
                  <div className={styles.name}>{entry.archetype}</div>
                  <div className={styles.barWrap}>
                    <div className={styles.bar} style={{ width: `${(entry.votes / maxVotes) * 100}%` }} />
                  </div>
                  <div className={styles.count}>
                    {entry.votes} <span className={styles.countLabel}>{entry.votes === 1 ? 'fan' : 'fans'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.footer}>
          <p>Updated every 60 seconds.</p>
        </div>
      </div>
    </main>
  )
}
