import { AppError, type ErrorTone } from "../../lib/httpError";
import { Container } from "../layout/Container";
import { Button } from "./Button";

type Props = {
	error: Error;
	variant?: "inline" | "page";
	onRetry?: () => void;
};

function boxClass(tone: ErrorTone): string {
	switch (tone) {
		case "warning":
			return "error-box error-box-warning";
		case "neutral":
			return "error-box error-box-neutral";
		case "danger":
		default:
			return "error-box error-box-danger";
	}
}

function titleToneClass(tone: ErrorTone): string {
	switch (tone) {
		case "warning":
			return "text-tone-warning";
		case "neutral":
			return "text-emphasis";
		case "danger":
		default:
			return "text-tone-danger";
	}
}

export function ErrorMessage({ error, variant = "inline", onRetry }: Props) {
	const isAppError = error instanceof AppError;
	const tone: ErrorTone = isAppError ? error.tone : "danger";
	const title = isAppError ? error.title : "Something went wrong";
	const detail = isAppError ? error.detail : error.message;
	const status = isAppError ? error.status : undefined;
	const canRetry =
		Boolean(onRetry) &&
		tone !== "neutral" &&
		status !== 401 &&
		status !== 403;
	const role = tone === "neutral" ? "status" : "alert";

	if (variant === "page") {
		return (
			<section className="py-12 md:py-16" role={role}>
				<Container narrow extraClass="flex flex-col items-start gap-3">
					{status ? <p className="text-meta m-0">{status}</p> : null}
					<h1 className="heading-page m-0">{title}</h1>
					<p className="text-intro m-0">{detail}</p>
					<div className="mt-3 flex flex-wrap gap-3">
						{canRetry ? <Button onClick={onRetry}>Try again</Button> : null}
						<Button to="/" variant="secondary">
							Back to latest posts
						</Button>
					</div>
				</Container>
			</section>
		);
	}

	return (
		<div role={role} className={boxClass(tone)}>
			<p className={`error-box-title m-0 ${titleToneClass(tone)}`}>{title}</p>
			<p className="text-body-sm m-0 mt-1">{detail}</p>
			{canRetry ? (
				<div className="mt-2.5">
					<button
						type="button"
						onClick={onRetry}
						className="link-inline cursor-pointer border-0 bg-transparent p-0 text-[14px]"
					>
						Try again
					</button>
				</div>
			) : null}
		</div>
	);
}
