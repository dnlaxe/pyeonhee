import { AppError } from "../lib/httpError";

function errorStyle(error: Error): string {
	const tone = error instanceof AppError ? error.tone : "danger";

	switch (tone) {
		case "warning":
			return "text-amber-700";
		case "neutral":
			return "text-green-600";
		case "danger":
		default:
			return "text-red-700";
	}
}

export function ErrorMessage({ error }: { error: Error }) {
	return <p className={errorStyle(error)}>{error.message}</p>;
}
