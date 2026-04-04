"use client";

import { useState } from "react";
import type { Proposal, ProposalSection, SectionKey } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn, statusColor, statusLabel } from "@/lib/utils";
import { Pencil, Check, X, Copy, ExternalLink, Send } from "lucide-react";
import { SECTION_LABELS, SECTION_ORDER } from "@/lib/db/proposals";

interface ProposalEditorProps {
  proposal: Proposal;
  appUrl: string;
}

export function ProposalEditor({ proposal, appUrl }: ProposalEditorProps) {
  const { show, ToastComponent } = useToast();
  const [sections, setSections] = useState<Record<SectionKey, string>>(
    () => buildSectionMap(proposal.sections ?? [])
  );
  const [editing, setEditing] = useState<SectionKey | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const publicUrl = `${appUrl}/p/${proposal.public_slug}`;

  function startEdit(key: SectionKey) {
    setEditing(key);
    setEditContent(sections[key] ?? "");
  }

  async function saveSection(key: SectionKey) {
    setSaving(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/section`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_key: key, content: editContent }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSections((prev) => ({ ...prev, [key]: editContent }));
      setEditing(null);
      show("Section saved", "success");
    } catch {
      show("Failed to save section", "error");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(null);
    setEditContent("");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    show("Link copied to clipboard", "success");
  }

  async function markSent() {
    setSharing(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      if (!res.ok) throw new Error();
      show("Proposal marked as sent", "success");
    } catch {
      show("Failed to update status", "error");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {ToastComponent}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusColor(proposal.status)
              )}
            >
              {statusLabel(proposal.status)}
            </span>
          </div>
          {proposal.client && (
            <p className="text-sm text-gray-500">
              {proposal.client.name}
              {proposal.client.company ? ` · ${proposal.client.company}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Preview
            </a>
          </Button>
          {proposal.status === "draft" && (
            <Button size="sm" loading={sharing} onClick={markSent}>
              <Send className="h-3.5 w-3.5" />
              Mark as sent
            </Button>
          )}
        </div>
      </div>

      {/* Share bar */}
      <div className="mb-8 flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
        <div className="flex-1 text-sm text-violet-700 font-mono truncate">
          {publicUrl}
        </div>
        <Button size="sm" variant="outline" onClick={copyLink}
          className="border-violet-200 text-violet-700 hover:bg-violet-100 flex-shrink-0">
          Copy
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTION_ORDER.map((key) => (
          <SectionCard
            key={key}
            sectionKey={key}
            label={SECTION_LABELS[key]}
            content={sections[key] ?? ""}
            isEditing={editing === key}
            editContent={editContent}
            saving={saving}
            onEdit={() => startEdit(key)}
            onSave={() => saveSection(key)}
            onCancel={cancelEdit}
            onEditChange={setEditContent}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionCardProps {
  sectionKey: SectionKey;
  label: string;
  content: string;
  isEditing: boolean;
  editContent: string;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditChange: (val: string) => void;
}

function SectionCard({
  label,
  content,
  isEditing,
  editContent,
  saving,
  onEdit,
  onSave,
  onCancel,
  onEditChange,
}: SectionCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50/60 border-b border-gray-100">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="p-5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => onEditChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[120px]"
              rows={Math.max(5, editContent.split("\n").length + 2)}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button size="sm" loading={saving} onClick={onSave}>
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content || <span className="text-gray-400 italic">Empty section</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function buildSectionMap(sections: ProposalSection[]): Record<SectionKey, string> {
  const map = {} as Record<SectionKey, string>;
  for (const s of sections) {
    map[s.section_key] = s.section_content;
  }
  return map;
}
