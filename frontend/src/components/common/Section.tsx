import React from "react";
import { cn } from "./cn";
import { Container } from "./Container";

export function Section({
  className,
  containerClassName,
  ...props
}: React.HTMLAttributes<HTMLElement> & { containerClassName?: string }) {
  return (
    <section className={cn("py-14 md:py-20", className)} {...props}>
      <Container className={containerClassName}>{props.children}</Container>
    </section>
  );
}