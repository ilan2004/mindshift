export default function LeaderboardTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-3">#</th>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Points</th>
            <th className="py-2 px-3">Streak</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className="border-b hover:bg-neutral-50">
              <td className="py-2 px-3">{i + 1}</td>
              <td className="py-2 px-3">{r.name}</td>
              <td className="py-2 px-3 font-semibold">{r.points}</td>
              <td className="py-2 px-3">{r.streak}🔥</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
