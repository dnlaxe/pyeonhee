import { AppError } from "../../lib/httpError";

function errorStyle(error: Error): string {
	const tone = error instanceof AppError ? error.tone : "danger";

	switch (tone) {
		case "warning":
			return "text-warning";
		case "neutral":
			return "text-success";
		case "danger":
		default:
			return "text-danger";
	}
}

export function ErrorMessage({ error }: { error: Error }) {
	return <p className={errorStyle(error)}>{error.message}</p>;
}
