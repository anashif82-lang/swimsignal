import { z } from "zod";

const swimTimeRegex = /^(\d{1,2}:)?\d{2}\.\d{2}$/;

export const competitionResultSchema = z.object({
  event_name:       z.string().min(1, "Event required").max(100),
  stroke:           z.enum(["freestyle", "backstroke", "breaststroke", "butterfly", "individual_medley"]).optional(),
  distance:         z.number().int().min(1).max(10000).optional(),
  final_time:       z.string().regex(swimTimeRegex, "Format: MM:SS.cc or SS.cc"),
  final_time_ms:    z.number().int().min(1),
  heat_time:        z.string().regex(swimTimeRegex).optional().or(z.literal("")),
  heat_time_ms:     z.number().int().min(1).optional(),
  place:            z.number().int().min(1).optional(),
  goal_time:        z.string().regex(swimTimeRegex).optional().or(z.literal("")),
  goal_time_ms:     z.number().int().min(1).optional(),
  is_personal_best: z.boolean().default(false),
  is_official:      z.boolean().default(true),
});

export const competitionSchema = z.object({
  name:             z.string().min(1, "Competition name required").max(200),
  competition_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  location:         z.string().max(200).optional().or(z.literal("")),
  level:            z.enum(["local", "regional", "national", "international"]).optional(),
  pool_length:      z.enum(["25m", "50m"]),
  notes:            z.string().max(2000).optional().or(z.literal("")),
  results:          z.array(competitionResultSchema).min(1, "Add at least one result"),
});

export type CompetitionInput = z.infer<typeof competitionSchema>;
export type CompetitionResultInput = z.infer<typeof competitionResultSchema>;
