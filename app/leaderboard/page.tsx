'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './leaderboard.module.css'

type Entry = { archetype: string; votes: number }
type Stats = { totalVotes: number; uniqueArchetypes: number }

export default function Leaderboard() {
  const [data, setData] = useState<Entry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(d => {
        setData(d.leaderboard ?? [])
        setStats(d.stats ?? null)
        setLoading(false)
      })
  }, [])

  const maxVotes = data[0]?.votes ?? 1

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

        {data.length === 0 ? (
          <div className={styles.empty}>
            <p>No votes yet.</p>
            <Link href="/" className={styles.voteLink}>Be the first →</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {data.map((entry) => {
              const trueRank = data.filter(e => e.votes > entry.votes).length + 1
              const rankClass = trueRank <= 3 ? styles[`rank${trueRank}` as keyof typeof styles] : ''
              return (
                <div key={entry.archetype} className={`${styles.row} ${rankClass ?? ''}`}>
                  <div className={styles.rank}>{trueRank}</div>
                  <div className={styles.name}>{entry.archetype}</div>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ width: `${(entry.votes / maxVotes) * 100}%` }}
                    />
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
