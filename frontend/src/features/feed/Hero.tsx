import { useEffect, useRef, useState } from "react";
import { heroPhrases } from "../../config";
import styles from "./Hero.module.css";

const INTERVAL_MS = 2500;
const EXIT_MS = 200;

type Phase = "idle" | "out" | "in";

function motionClass(phase: Phase, outClass: string, inClass: string) {
  if (phase === "out") return outClass;
  if (phase === "in") return inClass;
  return "";
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const [part1Phase, setPart1Phase] = useState<Phase>("idle");
  const [part2Phase, setPart2Phase] = useState<Phase>("idle");
  const indexRef = useRef(0);

  useEffect(() => {
    let swapTimer = 0;

    const interval = window.setInterval(() => {
      const prev = heroPhrases[indexRef.current];
      const nextIndex = (indexRef.current + 1) % heroPhrases.length;
      const next = heroPhrases[nextIndex];
      const part1Changed = next[0] !== prev[0];
      const part2Changed = next[1] !== prev[1];

      if (part1Changed) setPart1Phase("out");
      if (part2Changed) setPart2Phase("out");

      window.clearTimeout(swapTimer);
      swapTimer = window.setTimeout(() => {
        indexRef.current = nextIndex;
        setIndex(nextIndex);
        if (part1Changed) setPart1Phase("in");
        if (part2Changed) setPart2Phase("in");
      }, EXIT_MS);
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(swapTimer);
    };
  }, []);

  const [part1, part2] = heroPhrases[index];

  return (
    <div className={styles.heroBanner}>
      <div className={styles.heroBannerInner}>
        <div className={styles.heroBannerCopy}>
          <p className={styles.heroBannerLead}>Living in Korea?</p>
          <p className={styles.heroBannerRotating}>
            <span
              className={`inline-block ${motionClass(part1Phase, styles.heroOutUp, styles.heroInUp)}`}
            >
              {part1}
            </span>{" "}
            <span
              className={`inline-block ${motionClass(part2Phase, styles.heroOutDown, styles.heroInDown)}`}
            >
              {part2}
            </span>
            ?
          </p>
        </div>
        <p className={styles.heroBannerJoin}>Join the community!</p>
      </div>
    </div>
  );
}
