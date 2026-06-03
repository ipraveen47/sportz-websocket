import  express from 'express';
import  {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import {db} from "../db/db.js";
import {matches} from "../db/schema.js";
import {getMatchStatus} from "../utils/match-status.js";
import {desc} from "drizzle-orm";

export const matchRouter = express.Router();

matchRouter.get('/', async(req, res) => {

    const MAX_LIMIT = 100;

    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid query",
            details: JSON.stringify(parsed),
        });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

        try{
            const data = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);

            return res.status(200).json({
                data: data
            })
        } catch(e){
            res.status(500).json({
                message: 'Failed to list the matches'
            })
        }
    res.status(200).json({
        message: 'matches List',
    })
    }
);

matchRouter.post('/', async(req, res) => {

    const parsedBody = createMatchSchema.safeParse(req.body);
    const {data: {startTime, endTime, homeScore, awayScore}} = parsedBody;


    if(!parsedBody.success) {
        return res.status(400).json({
            message: 'Missing body',
            details:  JSON.stringify(parsedBody.error)
        });
    }

    try{

        const [event] = await db.insert(matches).values({
            ...parsedBody.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();

        res.status(201).json({
            data: event
        })

    } catch(e){
        return res.status(500).json({
            error: 'Failed to create match',
            details:  JSON.stringify(e)
        });
    }
})