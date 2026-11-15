import { LatestPosts } from "../feed";
import { Hero } from "./Hero";

export function LandingPage() {
  return (
    <main>
      <Hero />
      <LatestPosts />
    </main>
  );
}
