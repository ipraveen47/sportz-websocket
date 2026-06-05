import { z } from 'zod';

/**
 * Match Status Constants
 */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

const isoDateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid iso Date String',
});

/**
 * Query Params
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Route Params
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Helper to validate ISO date strings
 */
const isValidIsoDate = (value) => {
  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && value === date.toISOString();
};

/**
 * Create Match
 */
export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().min(1),

    awayTeam: z.string().min(1),

    startTime: isoDateString,
    endTime: isoDateString,
    homeScore: z.coerce.number().int().nonnegative().optional(),

    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'endTime must be after startTime',
      });
    }
  });

/**
 * Update Score
 */
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),

  awayScore: z.coerce.number().int().min(0),
});
