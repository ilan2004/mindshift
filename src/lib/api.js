export async function getLeaderboard() {
  // TODO: replace with backend call `/api/leaderboard` or Supabase query
  return [
    { id: "u1", name: "Ilan", points: 120, streak: 5 },
    { id: "u2", name: "Rohan", points: 110, streak: 4 },
    { id: "u3", name: "Hadee", points: 95, streak: 3 },
  ];
}

export async function getUserProfile(userId) {
  // placeholder
  return { id: userId, type: "Analyst", score: 3.4 };
}
