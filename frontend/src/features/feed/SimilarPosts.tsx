import { ListingCard, feedItemKey, type ListingKind } from "../../shared";
import { useFeedItems } from "./useFeedItems";

type Props = {
  kind: ListingKind;
  excludeId: string;
};

const LIMIT = 4;

export function SimilarPosts({ kind, excludeId }: Props) {
  const { items } = useFeedItems();

  if (!items) return null;

  const similar = items
    .filter((item) => item.kind === kind && item.id !== excludeId)
    .slice(0, LIMIT);

  if (similar.length === 0) return null;

  return (
    <section className="similar-posts" aria-label="Similar posts">
      <div className="similar-posts-inner">
        <h2 className="similar-posts-heading">Similar posts</h2>
        <div className="similar-posts-grid">
          {similar.map((item) => (
            <ListingCard key={feedItemKey(item)} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
