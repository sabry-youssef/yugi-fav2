import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'What is your favorite archetype? — YuGiFav',
  description: 'Every archetype has at least one fan. Prove it.',
  openGraph: {
    title: 'YuGiFav — Your favorite YuGiOh archetype',
    description: 'Every archetype has at least one fan. Prove it.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
