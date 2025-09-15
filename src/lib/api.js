// Mock data for leaderboards

// Mock database
let users = [
  { id: 1, name: "Alex", avatar: "👨‍💻", screenTime: 3.2, streak: 12, focusHours: 28.5, points: 120 },
  { id: 2, name: "Blake", avatar: "👩‍💻", screenTime: 4.5, streak: 8, focusHours: 32.1, points: 110 },
  { id: 3, name: "Casey", avatar: "🧑‍💻", screenTime: 2.1, streak: 5, focusHours: 25.6, points: 95 },
  { id: 4, name: "Dana", avatar: "👩‍🎨", screenTime: 5.2, streak: 3, focusHours: 18.9, points: 85 },
  { id: 5, name: "Eli", avatar: "👨‍🎓", screenTime: 1.8, streak: 15, focusHours: 35.2, points: 140 },
];

// In-memory storage for friends (in a real app, this would be in a database)
const friendsMap = new Map();

// Simulate API delay
const simulateApiCall = (data, delay = 500) => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

export async function getLeaderboard(type = 'points') {
  // Create a new array to avoid mutating the original
  const usersCopy = [...users];
  
  // Sort based on the type
  switch(type) {
    case 'points':
      return simulateApiCall(usersCopy.sort((a, b) => b.points - a.points));
    case 'streak':
      // Higher streak is better
      return simulateApiCall(usersCopy.sort((a, b) => b.streak - a.streak));
    case 'screenTime':
      // Lower screen time is better
      return simulateApiCall(usersCopy.sort((a, b) => a.screenTime - b.screenTime));
    case 'focusHours':
      // Higher focus hours are better
      return simulateApiCall(usersCopy.sort((a, b) => b.focusHours - a.focusHours));
    default:
      return simulateApiCall(usersCopy);
  }
}

// Search for users by name
export async function searchUsers(query) {
  if (!query.trim()) return [];
  const searchTerm = query.toLowerCase();
  return simulateApiCall(
    users.filter(user => 
      user.name.toLowerCase().includes(searchTerm)
    )
  );
}

// Get user's friends
export async function getFriends(userId) {
  return simulateApiCall(friendsMap.get(userId) || []);
}

// Add a friend
export async function addFriend(userId, friendId) {
  const userFriends = friendsMap.get(userId) || [];
  if (!userFriends.includes(friendId)) {
    friendsMap.set(userId, [...userFriends, friendId]);
  }
  return simulateApiCall({ success: true });
}

// Remove a friend
export async function removeFriend(userId, friendId) {
  const userFriends = friendsMap.get(userId) || [];
  friendsMap.set(
    userId, 
    userFriends.filter(id => id !== friendId)
  );
  return simulateApiCall({ success: true });
}

// Get user profile
export async function getUserProfile(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  
  const friends = await getFriends(userId);
  
  return simulateApiCall({
    ...user,
    friends,
    stats: {
      rank: users.findIndex(u => u.id === userId) + 1,
      totalUsers: users.length,
      friendCount: friends.length
    }
  });
}

// Get multiple users by IDs
export async function getUsersByIds(userIds = []) {
  return simulateApiCall(
    users.filter(user => userIds.includes(user.id))
  );
}

// -----------------------------
// Stakes (Contracts) API
// -----------------------------
const STAKES_KEY = "Nudge_stakes";

function lsGet(key, fallback) {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function getStakes() {
  const items = lsGet(STAKES_KEY, []);
  return simulateApiCall(items);
}

export async function createStake(payload) {
  const items = lsGet(STAKES_KEY, []);
  const now = Date.now();
  const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
  const stake = {
    id,
    status: "active", // active | succeeded | failed | cancelled
    createdAt: now,
    pinned: false,
    // optional fields supported in payload: type, amount, points, peer, goal, note,
    // startAt (ms), dueAt (ms), pinned (bool), days, minPerDay
    ...payload,
  };
  lsSet(STAKES_KEY, [stake, ...items]);
  return simulateApiCall(stake);
}

export async function updateStakeStatus(id, status) {
  const items = lsGet(STAKES_KEY, []);
  const next = items.map((s) => (s.id === id ? { ...s, status } : s));
  lsSet(STAKES_KEY, next);
  return simulateApiCall({ success: true });
}

export async function updateStake(id, patch) {
  const items = lsGet(STAKES_KEY, []);
  const next = items.map((s) => (s.id === id ? { ...s, ...patch } : s));
  lsSet(STAKES_KEY, next);
  return simulateApiCall(next.find((s) => s.id === id));
}

export async function deleteStake(id) {
  const items = lsGet(STAKES_KEY, []);
  lsSet(STAKES_KEY, items.filter((s) => s.id !== id));
  return simulateApiCall({ success: true });
}
