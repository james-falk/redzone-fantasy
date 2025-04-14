interface HeroProps {
  title: string[]
  description: string
}

const Hero: React.FC<HeroProps> = ({ title, description }) => {
  return (
    <section className="py-16 bg-zinc-100">
      {/* <div className="flex flex-col items-center justify-center text-center"> */}
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6 flex flex-wrap items-center gap-3 text-3xl font-bold text-gray-900 md:text-5xl">
          <mark className="mr-2 inline-block rounded bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1.5 tracking-wide text-white">
            {title[0]}
          </mark>
          {title[1]}
        </h1>
        <p className="text-lg text-gray-600 md:text-xl max-w-3xl">
          {description}
        </p>
      </div>
    </section>
  )
}

export default Hero
// import React from "react";

// interface HeroProps {
//   title: string;
//   description?: string;
// }

// const Hero: React.FC<HeroProps> = ({ title, description }) => {
//   return (
//     <div className="bg-zinc-100">
//       <div className="mx-auto max-w-3xl px-3 py-6 text-center md:py-11">
//         <h1 className="text-3xl font-semibold leading-tight text-stone-900 md:text-[40px]">
//           {title}
//         </h1>
//         {description && (
//           <h2 className="mt-5 text-lg text-stone-900 md:font-medium">
//             {description}
//           </h2>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Hero;
