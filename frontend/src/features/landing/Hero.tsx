import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRightIcon,
  BagIcon,
  BriefcaseIcon,
  CalendarIcon,
  PenIcon,
  SquareIcon,
  UsersIcon,
} from "../../shared";
import styles from "./Hero.module.css";

const part1Words = ["Looking for", "Want to share"];
const part2Words = ["work", "things to do", "used items", "help in English"];

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
  { to: "/placeholder", label: "Placeholder", Icon: SquareIcon },
  { to: "/post", label: "Post", Icon: PenIcon },
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
      const nextPart2 = (prevPart2 + 1) % part2Words.length;
      const nextPart1 =
        nextPart2 === 0 ? (prevPart1 + 1) % part1Words.length : prevPart1;
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
    <section className="pt-6 pb-4 md:pt-8">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <h1 className="m-0 mb-5 text-[28px] font-semibold leading-[1.35] tracking-[-0.4px] text-text-dark">
          <span className="block min-[721px]:inline-block">Foreign in Korea?</span>{" "}
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
        </span>{" "}
          <span className="block min-[721px]:inline-block">Join the community!</span>
        </h1>

        <nav
          className="grid grid-cols-3 gap-3 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1"
          aria-label="Browse"
        >
          {jumps.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 rounded-lg bg-yellow px-5 py-5 text-text-dark transition-colors hover:bg-yellow-accent"
            >
              <Icon className="shrink-0" />
              <span className="min-w-0 flex-1 font-semibold leading-tight">
                {label}
              </span>
              <ArrowRightIcon
                size={18}
                className="shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}