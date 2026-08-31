import type { ReactNode } from "react";

export function richText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}> {part.slice(2, -2)} </strong>;
    }
    return <span key={i}> {part} </span>;
  });
}

export function richParagraphs(text: string): ReactNode {
  return text
    .split(/\n\n+/)
    .map((para, i) => <p key={i}> {richText(para)} </p>);
}
