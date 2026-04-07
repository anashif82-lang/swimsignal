// ============================================================
// SwimSignal – Core TypeScript Types
// ============================================================

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type UserRole = "swimmer" | "coach";

export type GenderType =
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say";

export type ConnectionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "removed";

export type PoolLength = "25m" | "50m";

export type StrokeType =
  | "freestyle"
  | "backstroke"
  | "breaststroke"
  | "butterfly"
  | "individual_medley";

export type TrainingType = "water" | "dryland" | "gym" | "other";

export type SessionStatus = "completed" | "not_completed" | "partial";

export type CompetitionLevel =
  | "local"
  | "regional"
  | "national"
  | "international";

export type PbSource = "official" | "unofficial";

export type NotificationType =
  | "connection_request"
  | "connection_approved"
  | "workout_assigned"
  | "reminder"
  | "system";

// ─── DATABASE MODELS ──────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  city: string | null;
  country: string;
  is_verified: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  preferred_lang: string;
  onboarding_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface SwimmerProfile {
  id: string;
  birth_year: number | null;
  gender: GenderType | null;
  club_id: string | null;
  club_name_raw: string | null;
  strokes: StrokeType[];
  main_events: string[];
  goals: string | null;
  is_profile_public: boolean;
  updated_at: string;
  // Joined
  club?: Club;
}

export interface CoachProfile {
  id: string;
  club_id: string | null;
  club_name_raw: string | null;
  bio: string | null;
  credentials: string | null;
  updated_at: string;
  // Joined
  club?: Club;
}

export interface CoachSwimmerConnection {
  id: string;
  coach_id: string;
  swimmer_id: string;
  status: ConnectionStatus;
  initiated_by: string;
  message: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  coach?: Profile;
  swimmer?: Profile;
  swimmer_profile?: SwimmerProfile;
}

export interface SwimmerGroup {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  // Joined
  members?: Profile[];
  member_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_by: string;
  is_global: boolean;
  created_at: string;
}

// ─── TRAINING ─────────────────────────────────────────────────────────────────

export interface TrainingSet {
  id: string;
  session_id: string;
  set_order: number;
  repetitions: number;
  distance: number | null;
  stroke: StrokeType | null;
  equipment: string | null;
  target_time: string | null;
  actual_time: string | null;
  rest_seconds: number | null;
  description: string | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  swimmer_id: string;
  coach_id: string | null;
  session_date: string;
  training_type: TrainingType;
  pool_length: PoolLength | null;
  status: SessionStatus;
  total_distance: number | null;
  total_duration: number | null;
  rpe: number | null;
  title: string | null;
  notes: string | null;
  planned_workout_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  sets?: TrainingSet[];
  tags?: Tag[];
  swimmer?: Profile;
}

export interface PlannedWorkoutSet {
  id: string;
  workout_id: string;
  set_order: number;
  repetitions: number;
  distance: number | null;
  stroke: StrokeType | null;
  target_time: string | null;
  rest_seconds: number | null;
  description: string | null;
  created_at: string;
}

export interface PlannedWorkout {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  training_type: TrainingType;
  pool_length: PoolLength | null;
  estimated_distance: number | null;
  estimated_duration: number | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  sets?: PlannedWorkoutSet[];
}

// ─── COMPETITIONS ─────────────────────────────────────────────────────────────

export interface CompetitionResult {
  id: string;
  competition_id: string;
  swimmer_id: string;
  event_name: string;
  stroke: StrokeType | null;
  distance: number | null;
  pool_length: PoolLength;
  final_time: string;
  final_time_ms: number;
  heat_time: string | null;
  heat_time_ms: number | null;
  place: number | null;
  goal_time: string | null;
  goal_time_ms: number | null;
  is_personal_best: boolean;
  is_official: boolean;
  created_at: string;
}

export interface Competition {
  id: string;
  swimmer_id: string;
  name: string;
  competition_date: string;
  location: string | null;
  level: CompetitionLevel | null;
  pool_length: PoolLength;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  results?: CompetitionResult[];
}

export interface PersonalBest {
  id: string;
  swimmer_id: string;
  event_name: string;
  stroke: StrokeType;
  distance: number;
  pool_length: PoolLength;
  time_text: string;
  time_ms: number;
  achieved_at: string;
  source: PbSource;
  competition_id: string | null;
  result_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  // Joined
  sender?: Profile;
}

// ─── SEASONS ──────────────────────────────────────────────────────────────────

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

// ─── AGGREGATE / VIEW TYPES ───────────────────────────────────────────────────

export interface SwimmerStats {
  total_sessions: number;
  total_distance_km: number;
  total_duration_hours: number;
  sessions_this_week: number;
  sessions_this_month: number;
  pb_count: number;
}

export interface SwimmerWithProfile {
  profile: Profile;
  swimmer_profile: SwimmerProfile;
  connection: CoachSwimmerConnection;
  stats?: SwimmerStats;
}

export interface CoachWithProfile {
  profile: Profile;
  coach_profile: CoachProfile;
}

// ─── SWIM EVENTS CATALOG ──────────────────────────────────────────────────────

export interface SwimEvent {
  key: string;
  label: string;
  labelHe: string;
  stroke: StrokeType;
  distance: number;
}

export const SWIM_EVENTS: SwimEvent[] = [
  // Freestyle
  { key: "50m_freestyle",   label: "50m Freestyle",   labelHe: "50 מ' חופשי",   stroke: "freestyle",         distance: 50   },
  { key: "100m_freestyle",  label: "100m Freestyle",  labelHe: "100 מ' חופשי",  stroke: "freestyle",         distance: 100  },
  { key: "200m_freestyle",  label: "200m Freestyle",  labelHe: "200 מ' חופשי",  stroke: "freestyle",         distance: 200  },
  { key: "400m_freestyle",  label: "400m Freestyle",  labelHe: "400 מ' חופשי",  stroke: "freestyle",         distance: 400  },
  { key: "800m_freestyle",  label: "800m Freestyle",  labelHe: "800 מ' חופשי",  stroke: "freestyle",         distance: 800  },
  { key: "1500m_freestyle", label: "1500m Freestyle", labelHe: "1500 מ' חופשי", stroke: "freestyle",         distance: 1500 },
  // Backstroke
  { key: "50m_backstroke",  label: "50m Backstroke",  labelHe: "50 מ' גב",      stroke: "backstroke",        distance: 50   },
  { key: "100m_backstroke", label: "100m Backstroke", labelHe: "100 מ' גב",     stroke: "backstroke",        distance: 100  },
  { key: "200m_backstroke", label: "200m Backstroke", labelHe: "200 מ' גב",     stroke: "backstroke",        distance: 200  },
  // Breaststroke
  { key: "50m_breaststroke",  label: "50m Breaststroke",  labelHe: "50 מ' חזה",  stroke: "breaststroke",     distance: 50   },
  { key: "100m_breaststroke", label: "100m Breaststroke", labelHe: "100 מ' חזה", stroke: "breaststroke",     distance: 100  },
  { key: "200m_breaststroke", label: "200m Breaststroke", labelHe: "200 מ' חזה", stroke: "breaststroke",     distance: 200  },
  // Butterfly
  { key: "50m_butterfly",  label: "50m Butterfly",  labelHe: "50 מ' פרפר",  stroke: "butterfly",            distance: 50   },
  { key: "100m_butterfly", label: "100m Butterfly", labelHe: "100 מ' פרפר", stroke: "butterfly",            distance: 100  },
  { key: "200m_butterfly", label: "200m Butterfly", labelHe: "200 מ' פרפר", stroke: "butterfly",            distance: 200  },
  // Individual Medley
  { key: "100m_im",  label: "100m IM",  labelHe: "100 מ' קומבינציה",  stroke: "individual_medley",  distance: 100  },
  { key: "200m_im",  label: "200m IM",  labelHe: "200 מ' קומבינציה",  stroke: "individual_medley",  distance: 200  },
  { key: "400m_im",  label: "400m IM",  labelHe: "400 מ' קומבינציה",  stroke: "individual_medley",  distance: 400  },
];

export const STROKE_LABELS: Record<StrokeType, { en: string; he: string }> = {
  freestyle:         { en: "Freestyle",        he: "חופשי"       },
  backstroke:        { en: "Backstroke",        he: "גב"          },
  breaststroke:      { en: "Breaststroke",      he: "חזה"         },
  butterfly:         { en: "Butterfly",         he: "פרפר"        },
  individual_medley: { en: "Individual Medley", he: "קומבינציה"  },
};

export const TRAINING_TYPE_LABELS: Record<TrainingType, { en: string; he: string }> = {
  water:   { en: "Water",   he: "מים"      },
  dryland: { en: "Dryland", he: "יבשה"     },
  gym:     { en: "Gym",     he: "חדר כושר" },
  other:   { en: "Other",   he: "אחר"      },
};

// ─── FORM TYPES ───────────────────────────────────────────────────────────────

export interface OnboardingSwimmerData {
  full_name: string;
  birth_year: number;
  gender: GenderType;
  club_name: string;
  coach_id?: string;
  strokes: StrokeType[];
  main_events: string[];
  goals?: string;
}

export interface OnboardingCoachData {
  full_name: string;
  club_name: string;
  bio?: string;
  credentials?: string;
}

export interface TrainingSessionFormData {
  session_date: string;
  training_type: TrainingType;
  pool_length?: PoolLength;
  status: SessionStatus;
  title?: string;
  total_distance?: number;
  total_duration?: number;
  rpe?: number;
  notes?: string;
  sets: TrainingSetFormData[];
  tag_ids?: string[];
}

export interface TrainingSetFormData {
  set_order: number;
  repetitions: number;
  distance?: number;
  stroke?: StrokeType;
  equipment?: string;
  target_time?: string;
  actual_time?: string;
  rest_seconds?: number;
  description?: string;
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}
