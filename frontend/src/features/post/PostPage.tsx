import { Link } from "react-router";
import {
  BagIcon,
  BriefcaseIcon,
  Container,
  FaqLink,
  PageHeader,
  UsersIcon,
} from "../../shared";
import { config, postCopy } from "../../config";
import styles from "./PostPage.module.css";

const kindIcons = {
  job: BriefcaseIcon,
  market: BagIcon,
  service: UsersIcon,
} as const;

export function PostPage() {
  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <Container narrow>
          <PageHeader
            backTo="/"
            backLabel="back to home"
            title="Create a post"
            intro={
              <>
                Choose what you want to post. Jobs go to the job board, market
                posts to the marketplace, and services to English Services. See
                our <FaqLink>FAQs</FaqLink> for posting guidelines and safety
                tips.
              </>
            }
          />
          <div className="grid grid-cols-2 gap-3 min-[721px]:grid-cols-3">
            {config.postKinds.map((kind) => {
              const Icon = kindIcons[kind];
              return (
                <Link
                  key={kind}
                  to={`/post/${kind}`}
                  className={`${styles.choice} p-4`}
                >
                  <span className={styles.choiceIcon} aria-hidden>
                    <Icon strokeWidth={1.5} />
                  </span>
                  <span className={styles.choiceLabel}>
                    {postCopy[kind].label}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </article>
    </main>
  );
}
