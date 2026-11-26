type Props = {
  media?: boolean;
  extraClass?: string;
};

export function Skeleton({ media = false, extraClass }: Props) {
  const classes = [
    "skeleton-block",
    media ? "skeleton-media" : "",
    extraClass ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} aria-hidden />;
}
