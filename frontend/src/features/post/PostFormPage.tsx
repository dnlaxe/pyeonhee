import { Navigate, useParams } from "react-router";
import { Container, FaqLink, PageHeader } from "../../shared";
import { config, postCopy } from "../../config";
import { JobPostForm } from "./JobPostForm";
import { MarketPostForm } from "./MarketPostForm";
import { ServicePostForm } from "./ServicePostForm";

export function PostFormPage() {
  const { kind } = useParams();
  const postKind = config.postKinds.find((item) => item === kind);
  const kindInfo = postKind ? postCopy[postKind] : null;
  if (!kindInfo) {
    return <Navigate to="/post" replace />;
  }

  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <Container narrow>
          <PageHeader
            backTo="/post"
            backLabel="back to post"
            title={kindInfo.title}
            intro={
              <>
                {kindInfo.privacy} See our <FaqLink>FAQs</FaqLink> for posting
                guidelines and safety tips.
              </>
            }
          />
          {kind === "job" ? (
            <JobPostForm />
          ) : kind === "market" ? (
            <MarketPostForm />
          ) : (
            <ServicePostForm />
          )}
        </Container>
      </article>
    </main>
  );
}
