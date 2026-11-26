import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Prose,
  ContactForm,
  TagList,
  ErrorMessage,
  formatTimeSince,
  PinIcon,
} from "../../shared";
import { marketDetailQueryOptions } from "./queries";
import { MediaGallery } from "./MediaGallery";
import styles from "./MarketDetail.module.css";
import { SimilarPosts } from "../feed";

export function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: market,
    isPending,
    error,
  } = useQuery(marketDetailQueryOptions(queryClient, id));

  if (isPending) {
    return (
      <main>
        <Container>
          <p className="text-meta">Loading…</p>
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Container>
          <ErrorMessage error={error} />
        </Container>
      </main>
    );
  }

  if (!market) {
    return <Navigate to="/?kind=market" replace />;
  }

  const paragraphs = market.description.split("\n").filter(Boolean);

  return (
    <main>
      <article className="pt-5 pb-20 md:pt-7">
        <Container narrow>
          <MediaGallery key={market.id} images={market.images} />
          <h1 className={styles.title}>
            {market.pinned ? (
              <span className="pin-detail" aria-label="Pinned">
                <PinIcon />
              </span>
            ) : null}
            {market.title}
          </h1>
          <p className="text-meta m-0 mb-2">
            {formatTimeSince(market.createdAt)}
          </p>
          {market.price ? <p className={styles.price}>{market.price}</p> : null}
          <TagList tags={market.tags} extraClass="mb-7" />
          <Prose paragraphs={paragraphs} />
          <ContactForm
            actionLabel="Contact"
            extraClass="mt-8"
            email={market.email}
            kind="market"
            id={market.id}
          />
          <p className="m-0 mt-4">
            <Link to={`/report/market/${market.id}`} className="link-muted">
              Report this post
            </Link>
          </p>
        </Container>
      </article>
      <SimilarPosts kind="market" excludeId={market.id} />
    </main>
  );
}
