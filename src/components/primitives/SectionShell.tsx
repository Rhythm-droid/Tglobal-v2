import type { ReactNode } from "react";

interface SectionShellProps {
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function SectionShell({
  id,
  children,
  className = "",
  innerClassName = "",
}: SectionShellProps) {
  return (
    <section id={id} className={`section-pad relative ${className}`}>
      <div className={`site-shell ${innerClassName}`}>{children}</div>
    </section>
  );
}
