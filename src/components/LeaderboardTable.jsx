const Badge = ({ rank }) => {
  if (rank === 1) return <span className="inline-block w-6 h-6 bg-yellow-400 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold">🥇</span>;
  if (rank === 2) return <span className="inline-block w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">🥈</span>;
  if (rank === 3) return <span className="inline-block w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">🥉</span>;
  return <span className="w-6 h-6 flex items-center justify-center text-sm text-gray-400">{rank}</span>;
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
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-4 text-right">{getColumnHeader()}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user, index) => (
            <tr key={user.id} className="border-b hover:bg-neutral-50">
              <td className="py-3 px-4">
                <Badge rank={index + 1} />
              </td>
              <td className="py-3 px-4 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {user.avatar || user.name.charAt(0)}
                </div>
                <span>{user.name}</span>
              </td>
              <td className="py-3 px-4 text-right font-medium">
                {getValue(user)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
