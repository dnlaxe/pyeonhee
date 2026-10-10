import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

const part1Words = ["Looking for", "Want to share"];
const part2Words = ["work", "things to do", "unwanted items", "english help"];

const INTERVAL_MS = 2500;
const EXIT_MS = 200;

type Phase = "idle" | "out" | "in";

function motionClass(phase: Phase, outClass: string, inClass: string) {
  if (phase === "out") return outClass;
  if (phase === "in") return inClass;
  return "";
}

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
    <section className="py-12 pb-8">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <div className="bg-yellow px-7 py-10 md:px-10 md:py-[54px] rounded-lg">
          <h1 className="m-0 text-[clamp(40px,6vw,72px)] font-bold leading-[1.3] tracking-[-1.6px] text-text">
            Foreign in Korea?
            <br />
            <span
              className={`inline-block ${styles.darkBg} ${motionClass(part1Phase, styles.outUp, styles.inUp)}`}
                        >
              {part1Words[part1Index]}
            </span>
            <br />
            <span
              className={`inline-block ${styles.underline} ${motionClass(part2Phase, styles.outDown, styles.inDown)}`}
                      >
            {part2Words[part2Index]}?
          </span>
            <br />
            Join the community.
          </h1>
        </div>
      </div>
    </section>
  );
}