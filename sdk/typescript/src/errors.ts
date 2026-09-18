import { z } from "zod";

export type SentinelErrorCode =
  | "CONFIG"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "INVALID_ARGUMENT"
  | "TIMEOUT"
  | "INTERNAL"
  | "ITERATION_LIMIT"
  | "RETRY_EXHAUSTED";

export class SentinelError extends Error {
  readonly code: SentinelErrorCode;
  readonly cause?: unknown;
  /** Number of attempts made before this error was thrown (>1 if retried). */
  attempts: number;

  constructor(code: SentinelErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "SentinelError";
    this.code = code;
    this.cause = cause;
    this.attempts = 1;
  }
}

/**
 * Structured error thrown by SDK methods on all non-2xx API responses.
 * Carries the HTTP status code, machine-readable error code, human-readable
 * message, and the optional field that caused a validation failure.
 */
export class SentinelApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;
  /** Number of attempts made before this error was thrown (>1 if retried). */
  attempts: number;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.name = "SentinelApiError";
    this.status = status;
    this.code = code;
    this.field = field;
    this.attempts = 1;
  }
}

const ApiErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
  }),
});

/**
 * Parse a non-2xx response body into a SentinelApiError.
 * Falls back to code="INTERNAL" when the body is not a valid error envelope.
 */
export function parseApiError(status: number, body: string): SentinelApiError {
  try {
    const parsed = ApiErrorEnvelopeSchema.parse(JSON.parse(body));
    const { code, message, field } = parsed.error;
    return new SentinelApiError(status, code, message, field);
  } catch {
    return new SentinelApiError(status, "INTERNAL", body || `HTTP ${status}`);
  }
}

/** @deprecated Use parseApiError for structured errors from the API. */
export function httpStatusToError(
  status: number,
  body: string,
): SentinelError {
  switch (status) {
    case 401:
      return new SentinelError("UNAUTHORIZED", body || "Unauthorized");
    case 404:
      return new SentinelError("NOT_FOUND", body || "Not found");
    case 429:
      return new SentinelError("RATE_LIMITED", body || "Rate limit exceeded");
    default:
      return new SentinelError("INTERNAL", body || `HTTP ${status}`);
  }
}
