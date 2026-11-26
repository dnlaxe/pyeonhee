import type { ReactNode } from "react";
import { BackLink } from "./BackLink";

type Props = {
  backTo: string;
  backLabel: string;
  title: string;
  intro?: ReactNode;
};

export function PageHeader({ backTo, backLabel, title, intro }: Props) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <BackLink to={backTo} extraClass="icon-link inline-flex shrink-0">
          {backLabel}
        </BackLink>
        <h1 className="heading-page m-0">{title}</h1>
      </div>
      {intro ? <p className="text-intro mb-8">{intro}</p> : null}
    </>
  );
}
