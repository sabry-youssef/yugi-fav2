'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const [archetypes, setArchetypes] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [voted, setVoted] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalVotes: number; uniqueArchetypes: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/archetypes').then(r => r.json()),
      fetch('/api/vote').then(r => r.json()),
      fetch('/api/results').then(r => r.json()),
    ]).then(([arch, voteStatus, results]) => {
      setArchetypes(arch.archetypes ?? [])
      setFiltered(arch.archetypes ?? [])
      if (voteStatus.voted) setVoted(voteStatus.archetype)
      if (results.stats) setStats(results.stats)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(archetypes)
    } else {
      const q = query.toLowerCase()
      setFiltered(archetypes.filter(a => a.toLowerCase().includes(q)))
    }
  }, [query, archetypes])

  async function handleVote() {
    if (!selected || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archetype: selected }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setVoted(data.votedFor)
      } else if (!res.ok) {
        setError(data.error ?? 'Unknown error')
      } else {
        setVoted(selected)
        setStats(s => s ? { ...s, totalVotes: s.totalVotes + 1 } : null)
      }
    } catch {
      setError('Network error')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingGlyph}>☥</div>
        <p>Summoning archetypes…</p>
      </div>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.bgDeco} aria-hidden="true">
        <div className={styles.bgGlow} />
        <div className={styles.bgGlow2} />
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>THE GREAT QUESTION</div>
          <h1 className={styles.title}>
            What is your favorite
            <span className={styles.titleAccent}> archetype?</span>
          </h1>
          <p className={styles.subtitle}>
            Every archetype has at least one fan in this world.<br />
            Prove it.
          </p>
          {stats && (
            <div className={styles.statsRow}>
              <span className={styles.stat}>
                <strong>{stats.totalVotes.toLocaleString('en-US')}</strong> votes
              </span>
              <span className={styles.statDivider}>·</span>
              <span className={styles.stat}>
                <strong>{stats.uniqueArchetypes}</strong> archetypes represented
              </span>
              <span className={styles.statDivider}>·</span>
              <Link href="/leaderboard" className={styles.statLink}>View leaderboard →</Link>
            </div>
          )}
        </header>

        {voted ? (
          <div className={styles.votedState}>
            <div className={styles.votedGlyph}>✦</div>
            <h2 className={styles.votedTitle}>Your vote has been recorded</h2>
            <p className={styles.votedArchetype}>{voted}</p>
            <p className={styles.votedSub}>One more fan for {voted}. The theory holds.</p>
            <Link href="/leaderboard" className={styles.leaderboardBtn}>
              View full leaderboard
            </Link>
          </div>
        ) : (
          <div className={styles.voteSection}>
            <div className={styles.searchWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(null) }}
                placeholder="Search for an archetype…"
                className={styles.searchInput}
                autoComplete="off"
                spellCheck={false}
              />
              <span className={styles.searchIcon}>⌕</span>
              {query && (
                <button className={styles.clearBtn} onClick={() => { setQuery(''); setSelected(null); inputRef.current?.focus() }}>
                  ×
                </button>
              )}
            </div>

            <div className={styles.resultsInfo}>
              {query
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
                : `${archetypes.length} archetypes available`}
            </div>

            <div className={styles.grid}>
              {filtered.map(arch => (
                <button
                  key={arch}
                  className={`${styles.archCard} ${selected === arch ? styles.archCardSelected : ''}`}
                  onClick={() => setSelected(arch === selected ? null : arch)}
                >
                  <span className={styles.archName}>{arch}</span>
                  {selected === arch && <span className={styles.archCheck}>✓</span>}
                </button>
              ))}
            </div>

            {selected && (
              <div className={styles.confirmBar}>
                <div className={styles.confirmText}>
                  <span className={styles.confirmLabel}>Your pick:</span>
                  <span className={styles.confirmArchetype}>{selected}</span>
                </div>
                <button
                  className={styles.voteBtn}
                  onClick={handleVote}
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : 'Confirm my vote'}
                </button>
              </div>
            )}

            {error && <div className={styles.errorMsg}>{error}</div>}
          </div>
        )}
      </div>
    </main>
  )
}
