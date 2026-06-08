import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quel est ton archétype préféré ? — YuGiFav',
  description: 'Chaque archétype a au moins un fan. Prouve-le.',
  openGraph: {
    title: 'YuGiFav — Ton archétype YuGiOh préféré',
    description: 'Chaque archétype a au moins un fan. Prouve-le.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
