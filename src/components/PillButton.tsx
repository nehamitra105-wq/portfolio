import type { ReactNode } from "react";

// Outlined pill used in the footer. Hover matches "view case study": black
// fill, white stroke and white text.
export default function PillButton({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  const external = href.startsWith("http");

  return (
    <a
      className={`nm flex h-[40px] antialiased items-center justify-center rounded-[24px] border-[0.4px] border-solid border-black bg-white px-[16px] py-[8px] text-center text-[20px] leading-normal whitespace-nowrap text-black transition-colors duration-300 ease-in-out hover:border-white hover:bg-black hover:text-white ${className}`}
      href={href}
      rel={external ? "noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}
