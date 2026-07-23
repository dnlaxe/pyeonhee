export type ErrorTone = "warning" | "danger" | "neutral";

export class AppError extends Error {
	tone: ErrorTone;

	constructor(message: string, tone: ErrorTone = "danger") {
		super(message);
		this.name = "AppError";
		this.tone = tone;
	}
}

export function throwIfNotOk(res: Response): void {
	if (res.ok) return;

	switch (res.status) {
		case 429:
			throw new AppError(
				"Too many requests. Please try again in a moment.",
				"warning",
			);
		case 404:
			throw new AppError("Not found.", "neutral");
		case 401:
		case 403:
			throw new AppError("You don’t have access to this.", "warning");
		case 500:
		case 502:
		case 503:
		case 504:
			throw new AppError("Server error. Please try again later.", "danger");
		default:
			throw new AppError(
				`Something went wrong (HTTP ${res.status}).`,
				"danger",
			);
	}
}
