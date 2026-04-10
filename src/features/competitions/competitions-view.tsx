"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Competition, PersonalBest } from "@/types";
import { Button } from "@/components/ui/button";
import { CompetitionsList } from "./competitions-list";
import { PbGrid } from "./pb-grid";
import { LogCompetitionDialog } from "./log-competition-dialog";

interface Props {
  competitions: Competition[];
  pbs25: PersonalBest[];
  pbs50: PersonalBest[];
}

type Tab = "competitions" | "pbs";

export function CompetitionsView({ competitions, pbs25, pbs50 }: Props) {
  const [tab, setTab] = useState<Tab>("competitions");
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">תחרויות ושיאים אישיים</h1>
          <p className="text-navy-400 text-sm mt-0.5">
            {competitions.length} {competitions.length === 1 ? "תחרות" : "תחרויות"} מתועדות
          </p>
        </div>
        <Button
          variant="signal"
          size="sm"
          className="gap-1.5"
          onClick={() => setLogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          תעד תחרות
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-navy-900 rounded-lg w-fit">
        <TabButton active={tab === "competitions"} onClick={() => setTab("competitions")}>
          תחרויות
          {competitions.length > 0 && (
            <span className="ms-1.5 text-xs bg-navy-800 rounded px-1.5 py-0.5">
              {competitions.length}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "pbs"} onClick={() => setTab("pbs")}>
          שיאים אישיים
          {(pbs25.length + pbs50.length) > 0 && (
            <span className="ms-1.5 text-xs bg-navy-800 rounded px-1.5 py-0.5">
              {pbs25.length + pbs50.length}
            </span>
          )}
        </TabButton>
      </div>

      {/* Content */}
      {tab === "competitions" ? (
        <CompetitionsList
          competitions={competitions}
          onAdd={() => setLogOpen(true)}
        />
      ) : (
        <PbGrid pbs25={pbs25} pbs50={pbs50} />
      )}

      {/* Log competition dialog */}
      <LogCompetitionDialog open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "px-4 py-2 rounded-md text-sm font-medium bg-navy-800 text-white transition-colors"
          : "px-4 py-2 rounded-md text-sm font-medium text-navy-400 hover:text-navy-200 transition-colors"
      }
    >
      {children}
    </button>
  );
}
