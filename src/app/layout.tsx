import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/theme-context'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: 'Redzone Fantasy - Fantasy Football News & Analysis',
  description: 'Your ultimate destination for fantasy football news, videos, and podcasts. Stay updated with the latest content from top fantasy football sources.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
