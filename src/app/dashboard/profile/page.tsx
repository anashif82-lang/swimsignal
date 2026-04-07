import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white capitalize mb-2">profile</h1>
      <p className="text-navy-400 text-sm">
        This section is coming in the next phase.
      </p>
    </div>
  );
}
