const Badge = ({ rank }) => {
  if (rank === 1) return <span className="w-5 h-5 md:w-6 md:h-6 bg-yellow-400 text-yellow-800 rounded-full flex items-center justify-center text-xs md:text-sm font-bold">🥇</span>;
  if (rank === 2) return <span className="w-5 h-5 md:w-6 md:h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs md:text-sm font-bold">🥈</span>;
  if (rank === 3) return <span className="w-5 h-5 md:w-6 md:h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold">🥉</span>;
  return <span className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm text-gray-400 font-medium">{rank}</span>;
};

export default function LeaderboardTable({ rows = [], type = 'points' }) {
  const getValue = (user) => {
    switch(type) {
      case 'screenTime':
        return `${user.screenTime}h`;
      case 'streak':
        return `${user.streak} 🔥`;
      case 'focusHours':
        return `${user.focusHours}h`;
      default:
        return user.points;
    }
  };

  const getColumnHeader = () => {
    switch(type) {
      case 'screenTime':
        return 'Screen Time';
      case 'streak':
        return 'Streak';
      case 'focusHours':
        return 'Focus Hours';
      default:
        return 'Points';
    }
  };

  return (
    <div className="overflow-hidden">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 px-2 md:px-3 text-left font-medium text-gray-600">Rank</th>
            <th className="py-2 px-2 md:px-3 text-left font-medium text-gray-600">User</th>
            <th className="py-2 px-2 md:px-3 text-right font-medium text-gray-600">{getColumnHeader()}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user, index) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              <td className="py-2.5 px-2 md:px-3">
                <Badge rank={index + 1} />
              </td>
              <td className="py-2.5 px-2 md:px-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold flex-shrink-0" style={{ background: "var(--color-green-900)", color: "white" }}>
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{user.name}</span>
                </div>
              </td>
              <td className="py-2.5 px-2 md:px-3 text-right font-semibold">
                {getValue(user)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
