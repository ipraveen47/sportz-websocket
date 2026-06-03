// src/db/schema.js

import {
    pgTable,
    pgEnum,
    serial,

    integer,
    timestamp,
    jsonb,
    text,
} from "drizzle-orm/pg-core";

// Enum
export const matchStatusEnum = pgEnum("match_status", [
    "scheduled",
    "live",
    "finished",
]);

// Matches Table
export const matches = pgTable("matches", {
    id: serial("id").primaryKey(),
    sport: text("sport", { length: 50 }).notNull(),
    homeTeam: text("home_team", { length: 255 }).notNull(),
    awayTeam: text("away_team", { length: 255 }).notNull(),
    status: matchStatusEnum("status")
        .notNull()
        .default("scheduled"),
    startTime: timestamp("start_time", {
        withTimezone: true,
    }).notNull(),
    endTime: timestamp("end_time", {
        withTimezone: true,
    }),
    homeScore: integer("home_score")
        .notNull()
        .default(0),
    awayScore: integer("away_score")
        .notNull()
        .default(0),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});

// Commentary Table
export const commentary = pgTable("commentary", {
    id: serial("id").primaryKey(),
    matchId: integer("match_id")
        .notNull()
        .references(() => matches.id, {
            onDelete: "cascade",
        }),
    minute: integer("minute").notNull(),
    sequence: integer("sequence").notNull(),
    period: text("period", { length: 50 }),
    eventType: text("event_type", {
        length: 100,
    }).notNull(),
    actor: text("actor", { length: 255 }),

    team: text("team", { length: 255 }),

    message: text("message").notNull(),

    metadata: jsonb("metadata"),

    tags: text("tags").array(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});