import { AppError } from "../../lib/httpError";

function errorStyle(error: Error): string {
	const tone = error instanceof AppError ? error.tone : "danger";

	switch (tone) {
		case "warning":
			return "text-tone-warning";
		case "neutral":
			return "text-tone-success";
		case "danger":
		default:
			return "text-tone-danger";
	}
}

export function ErrorMessage({ error }: { error: Error }) {
	return <p className={errorStyle(error)}>{error.message}</p>;
}
