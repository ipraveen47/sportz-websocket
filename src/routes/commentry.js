import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { matchIdParamSchema } from '../validation/matches.js';
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from '../validation/commentary.js';

import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';

export const commentryRouter = Router({ mergeParams: true });

commentryRouter.post('/', async (req, res) => {
  const parsedParams = matchIdParamSchema.safeParse(req.params);

  console.log(req.params.id);

  if (!parsedParams.success) {
    return res.status(400).json({
      error: 'Invalid match id',
      details: parsedParams.error.flatten(),
    });
  }

  const parsedBody = createCommentarySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.flatten(),
    });
  }

  try {
    const [entry] = await db
      .insert(commentary)
      .values({
        matchId: parsedParams.data.id,
        ...parsedBody.data,
      })
      .returning();

    if (res.app.locals.broadCastCommentry) {
      res.app.locals.broadCastCommentry(entry.matchId, entry);
    }

    return res.status(201).json({
      data: entry,
    });
  } catch (error) {
    console.error('Create commentary error:', error);

    return res.status(500).json({
      error: 'Failed to create commentary',
      details: error,
    });
  }
});

commentryRouter.get('/', async (req, res) => {
  const MAX_LIMIT = 10;
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res.status(400).json({
      error: 'Invalid match ID',
      details: paramsResult.error.issues,
    });
  }

  const resultQuery = listCommentaryQuerySchema.safeParse(req.query);

  if (!resultQuery.success) {
    return res.status(400).json({
      message: 'Invalid query parameters',
    });
  }

  try {
    const matchId = paramsResult.data.id;
    const { limit = 10 } = resultQuery.data;

    const safelimit = Math.min(limit, MAX_LIMIT);

    console.log('matchId:', matchId);

    const result = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(safelimit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: 'Failed to list commentary query',
      details: resultQuery.error.issues,
    });
  }
});
