import { Logo } from "./Logo";
import { Navbar } from "./Navbar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-[rgba(250,250,250,0.86)] backdrop-blur-[10px]">
      <div className="mx-auto flex min-h-16 w-[min(100%-48px,1120px)] items-center justify-between max-md:w-[min(100%-32px,1120px)]">
        <Logo to="/" />
        <Navbar />
      </div>
    </header>
  );
}
