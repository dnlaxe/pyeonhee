import { useEffect, useRef, useState } from "react";

const part1Words = ["Want to share", "Looking for"];
const part2Words = ["things to do", "work", "used items", "English help"];

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
    <div className="hero-banner" aria-live="polite">
      <div className="hero-banner-inner">
        <div className="hero-banner-copy">
          <p className="hero-banner-lead">Living in Korea?</p>
          <p className="hero-banner-rotating">
            <span
              className={`inline-block ${motionClass(part1Phase, "hero-out-up", "hero-in-up")}`}
            >
              {part1Words[part1Index]}
            </span>{" "}
            <span
              className={`inline-block ${motionClass(part2Phase, "hero-out-down", "hero-in-down")}`}
            >
              {part2Words[part2Index]}
            </span>
            ?
          </p>
        </div>
        <p className="hero-banner-join">Join the community!</p>
      </div>
    </div>
  );
}
