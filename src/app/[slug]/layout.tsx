import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import Newsletter from '@/components/newsletter'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Course Details - Coursify'
  const description =
    'Discover comprehensive course details and start your learning journey with Coursify.'
  const url = 'https://yourdomain.com/courses'

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Coursify',
      type: 'website',
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      creator: '@Basit_Miyanji',
    },
  }

  return metadata
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Newsletter />
      <Footer />
    </>
  )
}
