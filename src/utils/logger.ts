/**
 * Structured logger.
 *
 * Every line is JSON on STDERR. Stderr matters: on the stdio transport,
 * stdout carries the MCP protocol, so a stray console.log there corrupts the
 * session. Nothing here ever logs a token, a header, or a full tool argument
 * object — only the field names, so a malformed call can still be diagnosed.
 */

import type { LogLevel } from "../config.js";

const ORDER: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

export interface LogFields {
  [key: string]: unknown;
}

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private write(level: Exclude<LogLevel, "silent">, msg: string, fields?: LogFields): void {
    if (ORDER[this.level] < ORDER[level]) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      service: "kanchanflow-mcp",
      msg,
      ...(fields ?? {}),
    });
    process.stderr.write(`${line}\n`);
  }

  error(msg: string, fields?: LogFields): void {
    this.write("error", msg, fields);
  }
  warn(msg: string, fields?: LogFields): void {
    this.write("warn", msg, fields);
  }
  info(msg: string, fields?: LogFields): void {
    this.write("info", msg, fields);
  }
  debug(msg: string, fields?: LogFields): void {
    this.write("debug", msg, fields);
  }
}

export const logger = new Logger(
  (process.env.KANCHANFLOW_MCP_LOG_LEVEL as LogLevel | undefined) ?? "info"
);
