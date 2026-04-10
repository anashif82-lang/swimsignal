import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents } from "@/lib/db/calendar";
import { CalendarGrid } from "@/features/calendar/calendar-grid";

export const metadata: Metadata = { title: "לוח שנה" };

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const now    = new Date();
  const year   = parseInt(params.year  ?? String(now.getFullYear()), 10);
  const month  = parseInt(params.month ?? String(now.getMonth() + 1), 10);

  const data = await getCalendarEvents(user.id, year, month);

  const totalEvents = data.trainings.length + data.competitions.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">לוח שנה</h1>
        <p className="text-navy-400 text-sm mt-0.5">
          {totalEvents} {totalEvents === 1 ? "אירוע" : "אירועים"} החודש
        </p>
      </div>
      <CalendarGrid data={data} year={year} month={month} />
    </div>
  );
}
