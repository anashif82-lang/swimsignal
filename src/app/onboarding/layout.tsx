import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col"
         style={{ background: "radial-gradient(ellipse at top, #0d2040 0%, #030d1a 70%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-signal-400/10 border border-signal-400/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-signal-400"/>
              <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400"/>
            </svg>
          </div>
          <span className="font-bold text-white">SwimSignal</span>
        </Link>
        <span className="text-xs text-navy-400">Setup</span>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-10">
        {children}
      </main>
    </div>
  );
}
