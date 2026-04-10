import { z } from "zod";

export const updateSwimmerProfileSchema = z.object({
  full_name:   z.string().min(2, "Name must be at least 2 characters").max(100),
  club_name:   z.string().min(1, "Club name required").max(100),
  birth_year:  z.number().int().min(1940).max(new Date().getFullYear() - 4).optional(),
  gender:      z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  strokes:     z.array(z.enum(["freestyle", "backstroke", "breaststroke", "butterfly", "individual_medley"])).min(1, "Select at least one stroke"),
  main_events: z.array(z.string()).min(1, "Select at least one event"),
  goals:       z.string().max(500).optional().or(z.literal("")),
});

export const updateCoachProfileSchema = z.object({
  full_name:   z.string().min(2, "Name must be at least 2 characters").max(100),
  club_name:   z.string().min(1, "Club name required").max(100),
  bio:         z.string().max(1000).optional().or(z.literal("")),
  credentials: z.string().max(500).optional().or(z.literal("")),
});

export type UpdateSwimmerProfileInput = z.infer<typeof updateSwimmerProfileSchema>;
export type UpdateCoachProfileInput   = z.infer<typeof updateCoachProfileSchema>;
