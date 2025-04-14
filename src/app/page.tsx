import { getAllCourses } from '@/services/courses'
import { posts } from '@/appData/courses'
import { Faqs } from '@/appData/faqs'
import Faq from '@/components/faq'
import Footer from '@/components/footer'
import Hero from '@/components/hero'
import Navbar from '@/components/navbar'
import Newsletter from '@/components/newsletter'
import ProductList from '@/components/product-list'
import SectionHeading from '@/components/section-heading'

export default async function Home() {
  const courses = await getAllCourses()

  return (
    <>
      <header>
        <Navbar />
        <Hero
          title={['Course', 'Directory']}
          description="Welcome to our course directory, your ultimate destination for learning and growth. Discover a wide range of courses designed to help you excel in web development, programming, and design!"
        />
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-3 my-12">
          <SectionHeading
            title={['Featured', 'Courses']}
            subtitle="Browse our curated collection of courses, tutorials, and guides to elevate your skills and expand your knowledge."
          />
          <ProductList products={courses} />
        </section>

        <Faq items={Faqs} />
        <Newsletter />
      </main>

      <Footer />
    </>
  )
}
