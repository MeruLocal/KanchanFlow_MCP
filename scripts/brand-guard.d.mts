/** Types for scripts/brand-guard.mjs, so TypeScript tests can import it. */
export declare function findBrandHits(text: unknown): { index: number; token: string }[];
export declare function isBrandClean(text: unknown): boolean;
export declare function assertBrandClean(label: string, text: unknown): void;
export declare function redactBrandGuardrail(text: string): string;
