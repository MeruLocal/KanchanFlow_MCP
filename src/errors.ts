/**
 * The error vocabulary every tool speaks.
 *
 * A tool never throws at the transport. It returns a structured envelope so
 * an AI client can tell "you asked for something that does not exist" apart
 * from "the server is broken", and act differently on each.
 */

export const ERROR_CODES = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "CONFLICT",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ToolErrorPayload {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    /** Field-level detail for VALIDATION_ERROR, or close matches for NOT_FOUND. */
    details?: unknown;
  };
}

export interface ToolSuccessPayload<T = unknown> {
  success: true;
  data: T;
}

export type ToolPayload<T = unknown> = ToolSuccessPayload<T> | ToolErrorPayload;

/**
 * A failure a tool raised deliberately. The message is written for an AI
 * client and is safe to show a user: it never carries a stack trace, a file
 * path, or anything read from the environment.
 */
export class ToolError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ToolError";
    this.code = code;
    this.details = details;
  }

  toPayload(): ToolErrorPayload {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details === undefined ? {} : { details: this.details }),
      },
    };
  }
}

export const notFound = (message: string, details?: unknown) =>
  new ToolError("NOT_FOUND", message, details);

export const validationError = (message: string, details?: unknown) =>
  new ToolError("VALIDATION_ERROR", message, details);

export const ok = <T>(data: T): ToolSuccessPayload<T> => ({ success: true, data });

/**
 * Turn an unknown thrown value into a payload. Anything that is not a
 * ToolError becomes a generic INTERNAL_ERROR: the real message is logged
 * server-side and never returned, because it can carry a filesystem path.
 */
export function toErrorPayload(err: unknown): ToolErrorPayload {
  if (err instanceof ToolError) return err.toPayload();
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "The KanchanFlow MCP server failed to complete this request.",
    },
  };
}
