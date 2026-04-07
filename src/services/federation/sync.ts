// ============================================================
// SwimSignal – Federation Sync Service (Phase 5 Scaffold)
// ============================================================
// This is a clean abstraction layer for future Israel Swimming Association
// (ISA) data synchronization. All methods are stubs that return empty/null.

export interface FederationResult {
  athleteId: string;
  eventName: string;
  poolLength: "25m" | "50m";
  timeText: string;
  timeMs: number;
  competitionName: string;
  competitionDate: string;
  isOfficialPB: boolean;
}

export interface FederationProfile {
  athleteId: string;
  fullName: string;
  birthYear: number;
  clubName: string;
  gender: string;
  results: FederationResult[];
}

export interface FederationSyncProvider {
  searchAthlete(query: string): Promise<FederationProfile[]>;
  getAthleteResults(athleteId: string): Promise<FederationResult[]>;
  getOfficialPBs(athleteId: string): Promise<FederationResult[]>;
}

// ── Stub implementation ───────────────────────────────────────────────────────

class StubFederationSync implements FederationSyncProvider {
  async searchAthlete(_query: string): Promise<FederationProfile[]> {
    // SCAFFOLD: Connect to ISA API in Phase 5
    return [];
  }

  async getAthleteResults(_athleteId: string): Promise<FederationResult[]> {
    return [];
  }

  async getOfficialPBs(_athleteId: string): Promise<FederationResult[]> {
    return [];
  }
}

export function createFederationSync(): FederationSyncProvider {
  // Future: return ISAFederationSync when API is available
  return new StubFederationSync();
}
