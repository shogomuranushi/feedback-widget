import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Feedback Widget',
  description: 'AI-powered feedback widget for GitHub issue creation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }} className="m-0 p-0">{children}</body>
    </html>
  )
}