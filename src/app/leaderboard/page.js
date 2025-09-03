import LeaderboardTable from "@/components/LeaderboardTable";
import { getLeaderboard } from "@/lib/api";

export const metadata = { title: "Leaderboard • MindShift" };

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <p className="text-sm text-neutral-600 mb-4">Mock data for now. Will connect to backend/Supabase.</p>
      <LeaderboardTable rows={rows} />
    </main>
  );
}
