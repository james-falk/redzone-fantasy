import { FC } from "react";

interface SectionHeadingProps {
  title: string[];
  subtitle?: string;
}

const SectionHeading: FC<SectionHeadingProps> = ({ title, subtitle }) => (
  <div className="my-7">
    <h2 className="text-2xl font-bold text-[#161616]">
      {title[0]} <span className="text-[#63D471]">{title[1]}</span>
    </h2>
    {subtitle && <p className="text-gray-600">{subtitle}</p>}
  </div>
);

export default SectionHeading;
