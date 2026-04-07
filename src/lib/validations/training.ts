import { z } from "zod";

const swimTimeRegex = /^(\d{1,2}:)?\d{2}\.\d{2}$/;

export const trainingSetSchema = z.object({
  set_order:   z.number().int().min(0),
  repetitions: z.number().int().min(1).max(999),
  distance:    z.number().int().min(1).max(10000).optional(),
  stroke:      z.enum(["freestyle", "backstroke", "breaststroke", "butterfly", "individual_medley"]).optional(),
  equipment:   z.string().max(100).optional(),
  target_time: z.string().regex(swimTimeRegex, "Format: MM:SS.cc or SS.cc").optional().or(z.literal("")),
  actual_time: z.string().regex(swimTimeRegex, "Format: MM:SS.cc or SS.cc").optional().or(z.literal("")),
  rest_seconds: z.number().int().min(0).max(3600).optional(),
  description: z.string().max(500).optional(),
});

export const trainingSessionSchema = z.object({
  session_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  training_type:  z.enum(["water", "dryland", "gym", "other"]),
  pool_length:    z.enum(["25m", "50m"]).optional(),
  status:         z.enum(["completed", "not_completed", "partial"]),
  title:          z.string().max(200).optional(),
  total_distance: z.number().int().min(0).max(100000).optional(),
  total_duration: z.number().int().min(0).max(720).optional(),
  rpe:            z.number().int().min(1).max(10).optional(),
  notes:          z.string().max(2000).optional(),
  sets:           z.array(trainingSetSchema).default([]),
  tag_ids:        z.array(z.string().uuid()).default([]),
}).refine(
  (d) => d.training_type !== "water" || d.pool_length !== undefined,
  { message: "Pool length is required for water sessions", path: ["pool_length"] }
);

export type TrainingSessionInput = z.infer<typeof trainingSessionSchema>;
export type TrainingSetInput = z.infer<typeof trainingSetSchema>;
