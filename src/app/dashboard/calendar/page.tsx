import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents } from "@/lib/db/calendar";
import { getScheduledSessions } from "@/lib/db/schedule";
import { ScheduleCalendar } from "@/features/calendar/schedule-calendar";
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function addWeeks(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n * 7); return r; }

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

  const from = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const to   = isoDate(addWeeks(now, 16));

  const [calendarData, scheduledSessions] = await Promise.all([
    getCalendarEvents(user.id, year, month),
    getScheduledSessions(user.id, from, to),
  ]);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-4 bg-white min-h-screen">
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-gray-900">לוח שנה</h1>
        <p className="text-gray-500 text-sm mt-0.5">תכנן את האימונים שלך</p>
      </div>

      <div className="flex-1 min-h-0">
        <ScheduleCalendar
          initialSessions={scheduledSessions}
          calendarData={calendarData}
          calendarYear={year}
          calendarMonth={month}
        />
      </div>
    </div>
  );
}
