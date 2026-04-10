import { z } from "zod";

const currentYear = new Date().getFullYear();

export const swimmerOnboardingSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  birth_year: z
    .number({ error: "Birth year is required" })
    .int()
    .min(1940, "Invalid birth year")
    .max(currentYear - 4, "Must be at least 4 years old"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    message: "Please select gender",
  }),
  club_name: z
    .string()
    .min(2, "Club name must be at least 2 characters")
    .max(100, "Club name is too long"),
  coach_id: z.string().optional(),
  strokes: z
    .array(z.enum(["freestyle", "backstroke", "breaststroke", "butterfly", "individual_medley"]))
    .min(1, "Select at least one stroke"),
  main_events: z
    .array(z.string())
    .min(1, "Select at least one event"),
  goals: z.string().max(500, "Goals too long").optional(),
});

export const coachOnboardingSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  club_name: z
    .string()
    .min(2, "Club name is required")
    .max(100, "Club name is too long"),
  bio: z.string().max(1000, "Bio is too long").optional(),
  credentials: z.string().max(500, "Credentials too long").optional(),
});

export type SwimmerOnboardingInput = z.infer<typeof swimmerOnboardingSchema>;
export type CoachOnboardingInput = z.infer<typeof coachOnboardingSchema>;
