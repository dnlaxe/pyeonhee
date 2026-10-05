import { useState } from "react";
import { Button } from "../../shared";

type JobDraft = {
  title: string;
};

function readDraft(): JobDraft | null {
  const raw = sessionStorage.getItem("jobDraft");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JobDraft;
  } catch {
    return null;
  }
}

export function PayPage() {
  const [draft] = useState(readDraft);

  return (
    <main>
      <article className="py-2 pb-20">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <h1 className="mb-4 text-[clamp(24px,4vw,32px)] font-bold leading-[1.2] tracking-[-0.5px] text-text">
            Payment
          </h1>
          {draft ? (
            <p className="mb-8 text-[15px] leading-normal text-body">
              5000 won for {draft.title}.
            </p>
          ) : (
            <p className="mb-8 text-[15px] leading-normal text-body">
              Start from the job form.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="yellow" to="/pay/done">
              Paid
            </Button>
            <Button variant="outline" to="/post/job">
              Cancel
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
}

export function PaidPage() {
  const [draft] = useState(readDraft);

  return (
    <main>
      <article className="py-2 pb-20">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <h1 className="mb-4 text-[clamp(24px,4vw,32px)] font-bold leading-[1.2] tracking-[-0.5px] text-text">
            Thank you
          </h1>
          <p className="text-[15px] leading-normal text-body">
            {draft ? `${draft.title} is paid.` : "This payment is paid."}
          </p>
        </div>
      </article>
    </main>
  );
}
