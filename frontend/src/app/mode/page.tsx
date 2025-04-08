import Image from "next/image";
import Link from "next/link";
import AuthMiddleware from "../../../utils/middleware";

const data = [
  {
    title: "Text",
    description:
      "Drop your headline or body text here. NoCap AI reads between the lines, sniffs out the cap, and tells you if it’s facts or fiction. Straight up. No fluff.",
    image: "/text.svg",
    link: "/mode/text",
  },
  {
    title: "Image",
    description:
      "Upload memes, screenshots, or news banners. NoCap AI runs visual receipts through OCR and NLP to find out if they’re real or just clickbait.",
    image: "/image.svg",
    link: "/mode/image",
  },
  {
    title: "Docs",
    description:
      "Upload your PDF, Word, or whatever file. Whether it’s an article, blog, or research, we’ll suss it out and tell you what’s valid and what’s sus.",
    image: "/file.svg",
    link: "/mode/docs",
  },
];

export default function Mode() {
  return (
    <AuthMiddleware>
      <div className="min-h-screen w-screen flex items-center justify-center gap-10 font-sans flex-col ">
        <h1 className="text-7xl font-bold">Let&apos;s get you started</h1>
        <div className="w-full h-full flex items-center justify-center gap-5">
          {data.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              description={item.description}
              image={item.image}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </AuthMiddleware>
  );
}

interface CardProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

const Card = ({ title, description, image, link }: CardProps) => {
  return (
    <Link
      href={link}
      className="group w-1/4 h-[28rem] flex flex-col items-start justify-around gap-10 bg-[#222] text-white rounded-lg px-8 py-5 hover:bg-[#333] hover:scale-[1.01] transition-all hover:shadow-sm hover:shadow-gray-700"
    >
      <div className="flex items-start flex-col justify-center gap-5">
        <Image
          src={image}
          alt={title}
          width={50}
          height={50}
          className="rounded-lg"
        />
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="font-medium text-[#b1b1b1]">{description}</p>
      </div>
      <button className="w-full px-5 py-3 bg-blue-500 group-hover:bg-blue-600 group-hover:pointer transition-all rounded-lg flex items-center justify-center gap-2">
        Try Now
      </button>
    </Link>
  );
};
