import { Barlow_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const display = Barlow_Condensed({
  subsets: ['latin'], weight: ['600','700','800'], variable: '--font-display',
})
const body = IBM_Plex_Sans({
  subsets: ['latin'], weight: ['400','500','600'], variable: '--font-body',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'], weight: ['400','500'], variable: '--font-mono',
})

export const metadata = {
  title: 'Broker Checker — Muñoz Trucking',
  description: 'Instantly verify any freight broker MC number against the live FMCSA database.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-steel-950 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
