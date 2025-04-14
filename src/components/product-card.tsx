import { FC } from 'react'
import { formatDate } from '../utils/functions'
import Link from 'next/link'

interface BlogPost {
  title: string
  shortDescription: string
  cover: string
  slug: string
  category: string
  publishDate: string
}

interface ProductCardProps {
  post: BlogPost
}

const ProductCard: FC<ProductCardProps> = ({ post }) => {
  const { title, slug, cover, publishDate, category } = post

  return (
    <Link href={`/${slug}`} className="no-underline">
      <div
        key={slug}
        className="flex transform flex-col gap-3 transition-transform hover:scale-105"
      >
        <figure className="relative h-48 w-full overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="h-full w-full rounded-xl bg-gray-200 object-cover"
          />
        </figure>

        <div className="mt-1 flex items-center gap-2">
          <span className="w-fit rounded-xl bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">
            {category}
          </span>
          <p className="text-sm font-semibold text-gray-500">
            {formatDate(publishDate)}
          </p>
        </div>

        <h3 className="hover:text-theme mb-2 text-xl font-bold transition-colors duration-200">
          {title}
        </h3>
      </div>
    </Link>
  )
}

export default ProductCard
