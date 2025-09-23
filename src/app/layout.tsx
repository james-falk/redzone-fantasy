import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

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
        <Providers>
          <div className="min-h-screen main-content">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
