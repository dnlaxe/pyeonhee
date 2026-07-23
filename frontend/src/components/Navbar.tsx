import { Link } from "react-router";

export function Navbar() {
	return (
		<header className="border-b border-stone-600">
			<nav className="mx-auto flex max-w-xl items-center gap-4 py-3">
				<Link to="/" className="text-lg font-bold">
					Pyeonhee
				</Link>
				<Link to="/" className="underline">
					Jobs
				</Link>
			</nav>
		</header>
	);
}
