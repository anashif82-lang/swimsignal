import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אנליטיקה",
};

export default function Page() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white capitalize mb-2">אנליטיקה</h1>
      <p className="text-navy-400 text-sm">יגיע בשלב הבא.</p>
    </div>
  );
}
