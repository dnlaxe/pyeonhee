type Props = {
  children: React.ReactNode;
  className?: string;
};

export function EmptyState({ children, className }: Props) {
  return (
    <p
      className={`mt-9 text-center font-mono text-[15px] leading-normal text-muted${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </p>
  );
}
