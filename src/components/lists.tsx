import { FC } from 'react'

interface ListsProps {
  title?: string
  items: string[]
}

const Lists: FC<ListsProps> = ({ title = 'Courses Offered', items }) => {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">{title}</h2>
      <ul className="space-y-5">
        {items.map((item, index) => (
          <li
            key={index}
            className="relative ml-9 font-normal text-gray-700 before:absolute before:-ml-7 before:-mt-[6px] before:rotate-45 before:-scale-x-100 before:text-2xl before:font-semibold before:text-[#00AAFF] before:content-['L'] md:font-medium"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Lists
