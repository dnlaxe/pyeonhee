export type ErrorTone = "warning" | "danger" | "neutral";

type AppErrorOptions = {
	tone?: ErrorTone;
	title?: string;
	detail?: string;
	status?: number;
};

export class AppError extends Error {
	tone: ErrorTone;
	title: string;
	detail: string;
	status?: number;

	constructor(message: string, options: AppErrorOptions = {}) {
		super(message);
		this.name = "AppError";
		this.tone = options.tone ?? "danger";
		this.title = options.title ?? "Something went wrong";
		this.detail = options.detail ?? message;
		this.status = options.status;
	}
}

export function throwIfNotOk(res: Response): void {
	if (res.ok) return;

	switch (res.status) {
		case 429:
			throw new AppError(
				"Too many requests. Please try again in a moment.",
				{
					tone: "warning",
					title: "Too many requests",
					detail: "Please try again in a moment.",
					status: 429,
				},
			);
		case 404:
			throw new AppError("Not found.", {
				tone: "neutral",
				title: "Not found",
				detail: "This post may have been removed or the link is outdated.",
				status: 404,
			});
		case 401:
		case 403:
			throw new AppError("You don’t have access to this.", {
				tone: "warning",
				title: "No access",
				detail: "You don’t have access to this.",
				status: res.status,
			});
		case 500:
		case 502:
		case 503:
		case 504:
			throw new AppError("Server error. Please try again later.", {
				tone: "danger",
				title: "Server error",
				detail: "Please try again later.",
				status: res.status,
			});
		default:
			throw new AppError(`Something went wrong (HTTP ${res.status}).`, {
				tone: "danger",
				title: "Something went wrong",
				detail: `Couldn’t complete the request (HTTP ${res.status}). Please try again.`,
				status: res.status,
			});
	}
}
