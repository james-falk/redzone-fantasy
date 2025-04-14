"use client";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

interface Item {
  title: string;
  content: string;
}

interface FaqProps {
  items: Item[];
}

const Faq: React.FC<FaqProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex((prevActiveIndex) => {
      const indexExists = prevActiveIndex === index;

      if (indexExists) {
        return null;
      }

      return index;
    });
  };

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[550px_1fr] md:gap-14 md:p-8">
      <h2 className="text-center text-4xl font-bold text-gray-600 md:text-left md:text-6xl">
        Frequently asked questions
      </h2>

      <div>
        {items.map(({ title, content }, idx) => (
          <div
            key={idx}
            onClick={() => toggleFaq(idx)}
            className="flex cursor-pointer items-start gap-4 border-b border-gray-300 py-5 last:border-0"
          >
            <div className="mt-0.5">
              {idx === activeIndex ? (
                <MinusIcon color="#047857" />
              ) : (
                <PlusIcon color="#047857" />
              )}
            </div>

            <div>
              <h4 className="text-lg font-medium">{title}</h4>
              <div
                className={`${
                  idx === activeIndex
                    ? "grid grid-rows-[1fr]"
                    : "grid grid-rows-[0fr]"
                }  transition-all duration-300`}
              >
                <p className="mt-2 overflow-hidden text-left text-gray-700">
                  {content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
