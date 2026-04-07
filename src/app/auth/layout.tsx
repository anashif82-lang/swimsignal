import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4"
         style={{ background: "radial-gradient(ellipse at top, #0d2040 0%, #030d1a 60%)" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10 group">
        <div className="w-9 h-9 rounded-lg bg-signal-400/10 border border-signal-400/30 flex items-center justify-center group-hover:border-signal-400/60 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-signal-400"/>
            <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-signal-400"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">SwimSignal</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-navy-500">
        &copy; {new Date().getFullYear()} SwimSignal. All rights reserved.
      </p>
    </div>
  );
}
