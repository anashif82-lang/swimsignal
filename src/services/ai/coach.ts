// ============================================================
// SwimSignal – AI Coach Service (Phase 5 Scaffold)
// ============================================================
// This is a clean abstraction layer for the future AI Coach feature.
// Replace StubAICoach with a real provider when ready.

export interface AICoachInput {
  swimmerId: string;
  recentSessions: Array<{
    date: string;
    type: string;
    distance: number;
    rpe: number;
  }>;
  personalBests: Array<{
    event: string;
    time: string;
    poolLength: string;
  }>;
  goals: string;
}

export interface AICoachRecommendation {
  type: "load_adjustment" | "focus_area" | "event_prediction" | "recovery";
  title: string;
  body: string;
  confidence: number; // 0-1
  data?: Record<string, unknown>;
}

export interface AICoachProvider {
  getRecommendations(input: AICoachInput): Promise<AICoachRecommendation[]>;
}

// ── Stub implementation (safe for production, returns empty) ──────────────────

class StubAICoach implements AICoachProvider {
  async getRecommendations(_input: AICoachInput): Promise<AICoachRecommendation[]> {
    // SCAFFOLD: Replace with real AI provider in Phase 5
    return [];
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createAICoach(): AICoachProvider {
  // Future: check env vars and return appropriate provider
  // if (process.env.OPENAI_API_KEY) return new OpenAICoach(process.env.OPENAI_API_KEY);
  return new StubAICoach();
}
