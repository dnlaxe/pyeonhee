import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <ErrorMessage error={error} />
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
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <MediaGallery key={market.id} images={market.images} />
          <h1 className={styles.title}>
            {market.pinned ? (
              <span className="mr-[0.35em] inline-flex align-middle" aria-label="Pinned">
                <PinIcon />
              </span>
            ) : null}
            {market.title}{" "}
            <span className="align-middle text-sm font-normal text-muted">
              {formatTimeSince(market.createdAt)}
            </span>
          </h1>
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
          <p className="mt-4 m-0">
            <Link
              to={`/report/market/${market.id}`}
              className="text-[13px] text-muted underline underline-offset-[3px]"
            >
              report this post
            </Link>
          </p>
        </div>
      </article>
      <SimilarPosts kind="market" excludeId={market.id} />
    </main>
  );
}
