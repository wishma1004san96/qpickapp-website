import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

/**
 * Site-wide content width contract.
 * Every section must use this — do not invent parallel max-width / padding systems.
 *
 * max-w-6xl · mx-auto · w-full · min-w-0 · px-5 · sm:px-6 · lg:px-8
 */
export function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={["mx-auto w-full min-w-0 max-w-6xl px-5 sm:px-6 lg:px-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
