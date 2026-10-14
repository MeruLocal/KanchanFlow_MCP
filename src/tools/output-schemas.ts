/**
 * Output schemas for the core tools.
 *
 * Each describes the success envelope `{ success: true, data: {...} }` that the
 * tool returns as structuredContent. Nested content copied from the mirror is
 * `.passthrough()`, so a field the website adds does not break validation;
 * the fields a client relies on are typed.
 *
 * The SDK validates structuredContent against these on every successful call
 * and skips validation for isError results.
 */

import { z, type ZodRawShape } from "zod";

/** source: syncedAt plus the freshness fields the registry adds. */
const source = z
  .object({
    syncedAt: z.string(),
    ageDays: z.number().nullable().optional(),
    stale: z.boolean().optional(),
    note: z.string().optional(),
  })
  .passthrough();

const money = z.object({ value: z.number(), exact: z.boolean(), display: z.string() }).passthrough();

const link = z.object({ label: z.string(), url: z.string() }).passthrough();

const envelope = (data: z.ZodTypeAny): ZodRawShape => ({ success: z.literal(true), data });

export const pricingOutput: ZodRawShape = envelope(
  z
    .object({
      currency: z
        .object({
          countryCode: z.string(),
          currency: z.string(),
          contracted: z.boolean(),
          billedIn: z.string(),
          basis: z.string(),
        })
        .passthrough(),
      annualDiscountPct: z.number(),
      trial: z.object({}).passthrough(),
      tiers: z.array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            minUsers: z.number(),
            maxUsers: z.number().nullable(),
            monthlyPerUser: money,
            annualPerUser: money,
            platformFeePerMonth: money.nullable(),
            highlights: z.array(z.string()),
          })
          .passthrough()
      ),
      neverGated: z.array(z.string()),
      cta: z.object({ trial: link.optional(), demo: link.optional() }).passthrough(),
      urls: z.record(z.string()),
      source,
    })
    .passthrough()
);

export const compareTiersOutput: ZodRawShape = envelope(
  z
    .object({
      columns: z.array(z.string()),
      groups: z.array(z.object({ group: z.string(), rows: z.array(z.array(z.string())) }).passthrough()),
      availableGroups: z.array(z.string()),
      rowCount: z.number(),
      legend: z.object({}).passthrough(),
      url: z.string(),
      source,
    })
    .passthrough()
);

export const listFeaturesOutput: ZodRawShape = envelope(
  z
    .object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
      statusCounts: z.record(z.number()),
      categories: z.array(z.string()),
      features: z.array(
        z
          .object({
            slug: z.string(),
            name: z.string(),
            category: z.string(),
            status: z.enum(["live", "beta", "building", "planned"]),
            target: z.string().nullable(),
            wave: z.number().nullable(),
            lead: z.string(),
            url: z.string(),
          })
          .passthrough()
      ),
      statusLegend: z.record(z.string()),
      source,
    })
    .passthrough()
);

export const searchOutput: ZodRawShape = envelope(
  z
    .object({
      query: z.string(),
      total: z.number(),
      returned: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
      nextOffset: z.number().optional(),
      typesSearched: z.array(z.string()),
      results: z.array(
        z
          .object({
            type: z.string(),
            slug: z.string(),
            title: z.string(),
            snippet: z.string(),
            status: z.string().optional(),
            url: z.string(),
            score: z.number(),
            followUpTool: z.string(),
          })
          .passthrough()
      ),
      note: z.string().optional(),
      source,
    })
    .passthrough()
);
