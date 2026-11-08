import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  BagIcon,
  BriefcaseIcon,
  CalendarIcon,
  PenIcon,
  UsersIcon,
} from "../../shared";
import styles from "./Hero.module.css";

const part1Words = ["Looking for", "Want to share"];
const part2Words = ["work", "things to do", "used items", "English help"];

const INTERVAL_MS = 2500;
const EXIT_MS = 200;

type Phase = "idle" | "out" | "in";

function motionClass(phase: Phase, outClass: string, inClass: string) {
  if (phase === "out") return outClass;
  if (phase === "in") return inClass;
  return "";
}

const jumps = [
  { to: "/jobs", label: "Jobs", Icon: BriefcaseIcon },
  { to: "/market", label: "Market", Icon: BagIcon },
  { to: "/services", label: "Services", Icon: UsersIcon },
  { to: "/events", label: "Events", Icon: CalendarIcon },
  { to: "/post", label: "Post", Icon: PenIcon, hideBelow1040: true },
] as const;

export function Hero() {
  const [part1Index, setPart1Index] = useState(0);
  const [part2Index, setPart2Index] = useState(0);
  const [part1Phase, setPart1Phase] = useState<Phase>("idle");
  const [part2Phase, setPart2Phase] = useState<Phase>("idle");
  const part1IndexRef = useRef(0);
  const part2IndexRef = useRef(0);

  useEffect(() => {
    let swapTimer = 0;

    const interval = window.setInterval(() => {
      const prevPart1 = part1IndexRef.current;
      const prevPart2 = part2IndexRef.current;
      const nextPart1 = (prevPart1 + 1) % part1Words.length;
      const nextPart2 = (prevPart2 + 1) % part2Words.length;
      const part1Changed = nextPart1 !== prevPart1;
      const part2Changed = nextPart2 !== prevPart2;

      if (part1Changed) setPart1Phase("out");
      if (part2Changed) setPart2Phase("out");

      window.clearTimeout(swapTimer);
      swapTimer = window.setTimeout(() => {
        if (part1Changed) {
          part1IndexRef.current = nextPart1;
          setPart1Index(nextPart1);
          setPart1Phase("in");
        }
        if (part2Changed) {
          part2IndexRef.current = nextPart2;
          setPart2Index(nextPart2);
          setPart2Phase("in");
        }
      }, EXIT_MS);
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(swapTimer);
    };
  }, []);

  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col pt-12 pb-6 md:min-h-0 md:pt-8 md:pb-4">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <h1 className="m-0 mb-5 text-center text-[28px] max-[399px]:text-[22px] font-semibold leading-[1.35] tracking-[-0.4px] text-text-dark min-[721px]:flex min-[721px]:items-baseline min-[721px]:justify-between min-[721px]:gap-4 min-[721px]:text-left">
        <span className="block min-[721px]:min-w-0">
          <span className="block min-[721px]:inline-block">
            Living in Korea?
          </span>{" "}
          <span className="block min-[721px]:inline-block">
            <span
              className={`inline-block ${motionClass(part1Phase, styles.outUp, styles.inUp)}`}
            >
              {part1Words[part1Index]}
            </span>{" "}
            <span
              className={`inline-block ${motionClass(part2Phase, styles.outDown, styles.inDown)}`}
            >
              {part2Words[part2Index]}
            </span>
            ?
          </span>
        </span>
          <span className="block shrink-0 text-muted">Join the community!</span>
        </h1>

        <nav className="relative" aria-label="Browse">
          <div className="grid grid-cols-5 gap-3 max-[1040px]:grid-cols-4 max-[720px]:grid-cols-2">
            {jumps.map(({ to, label, Icon, ...rest }) => {
              const hideBelow1040 =
                "hideBelow1040" in rest && rest.hideBelow1040;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`@container group relative aspect-square overflow-hidden rounded-lg bg-yellow p-4 text-text-dark transition-colors hover:bg-yellow-accent${
                    hideBelow1040 ? " max-[1040px]:hidden" : ""
                  }`}
                >
                <span
                  className="pointer-events-none absolute bottom-[4%] right-[2%] w-[56%] text-text-dark/[0.12] transition-transform duration-300 group-hover:scale-105 [&_svg]:size-full"
                  aria-hidden
                >
                  <Icon strokeWidth={1.5} />
                </span>
                  <span className="relative">
                  <span className="text-[14cqi] font-semibold leading-[1.1] tracking-[-0.02em]">
                    {label}
                  </span>
                </span>
                </Link>
              );
            })}
          </div>

          <Link
            to="/post"
            className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-yellow px-5 py-4 text-text-dark shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-colors hover:bg-yellow-accent max-[1040px]:inline-flex"
            aria-label="Post"
          >
            <PenIcon size={22} className="shrink-0" />
            <span className="text-lg font-semibold leading-[1.2] tracking-wider">
            Post
          </span>
          </Link>
        </nav>
      </div>
    </section>
  );
}