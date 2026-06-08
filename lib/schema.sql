-- Run this once in your Neon database console

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  archetype TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One vote per IP
CREATE UNIQUE INDEX IF NOT EXISTS votes_ip_hash_idx ON votes (ip_hash);

-- Fast lookup by archetype
CREATE INDEX IF NOT EXISTS votes_archetype_idx ON votes (archetype);
