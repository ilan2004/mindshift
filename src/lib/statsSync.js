import { saveProfileField } from './profileService';

/**
 * Helper functions to sync local statistics with Supabase
 * Call these when statistics are updated locally
 */

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Sync points to cloud (debounced to avoid too many API calls)
const syncPointsDebounced = debounce(async (points) => {
  try {
    await saveProfileField('points', points);
  } catch (error) {
    console.warn('Failed to sync points:', error);
  }
}, 2000);

// Sync streak to cloud (immediate, as it's updated less frequently)
export async function syncStreak(streak) {
  try {
    await saveProfileField('streak', streak);
  } catch (error) {
    console.warn('Failed to sync streak:', error);
  }
}

// Sync total focus minutes to cloud (debounced)
const syncTotalMinutesDebounced = debounce(async (totalMinutes) => {
  try {
    await saveProfileField('total_focus_minutes', totalMinutes);
  } catch (error) {
    console.warn('Failed to sync total focus minutes:', error);
  }
}, 3000);

// Sync MBTI type to cloud (immediate, as it's set once)
export async function syncMbtiType(mbtiType) {
  try {
    await saveProfileField('mbti_type', mbtiType);
  } catch (error) {
    console.warn('Failed to sync MBTI type:', error);
  }
}

// Main sync functions to export
export function syncPoints(points) {
  syncPointsDebounced(points);
}

export function syncTotalFocusMinutes(totalMinutes) {
  syncTotalMinutesDebounced(totalMinutes);
}

// Sync all stats at once (useful for periodic full sync)
export async function syncAllStats() {
  try {
    const points = Number(localStorage.getItem('mindshift_points')) || 0;
    const streak = Number(localStorage.getItem('mindshift_streak')) || 0;
    const totalMinutes = Number(localStorage.getItem('mindshift_total_focus_time')) || 0;
    const mbtiType = localStorage.getItem('mindshift_personality_type') || '';

    // Sync all simultaneously
    const promises = [];
    if (points > 0) promises.push(saveProfileField('points', points));
    if (streak > 0) promises.push(saveProfileField('streak', streak));
    if (totalMinutes > 0) promises.push(saveProfileField('total_focus_minutes', totalMinutes));
    if (mbtiType) promises.push(saveProfileField('mbti_type', mbtiType));

    await Promise.allSettled(promises);
  } catch (error) {
    console.warn('Failed to sync all stats:', error);
  }
}

// Hook into localStorage changes to auto-sync
export function setupAutoSync() {
  if (typeof window === 'undefined') return;

  // Listen for custom events that indicate stats changes
  const handleStatsUpdate = (event) => {
    if (event.type === 'mindshift:points:update') {
      const points = Number(localStorage.getItem('mindshift_points')) || 0;
      syncPoints(points);
    } else if (event.type === 'mindshift:streak:update') {
      const streak = Number(localStorage.getItem('mindshift_streak')) || 0;
      syncStreak(streak);
    } else if (event.type === 'mindshift:focus:session:complete') {
      const totalMinutes = Number(localStorage.getItem('mindshift_total_focus_time')) || 0;
      syncTotalFocusMinutes(totalMinutes);
    } else if (event.type === 'mindshift:mbti:update') {
      const mbtiType = localStorage.getItem('mindshift_personality_type') || '';
      if (mbtiType) syncMbtiType(mbtiType);
    }
  };

  // Listen for various update events
  window.addEventListener('mindshift:points:update', handleStatsUpdate);
  window.addEventListener('mindshift:streak:update', handleStatsUpdate);
  window.addEventListener('mindshift:focus:session:complete', handleStatsUpdate);
  window.addEventListener('mindshift:mbti:update', handleStatsUpdate);
  window.addEventListener('mindshift:counters:update', handleStatsUpdate);

  // Periodic full sync every 5 minutes
  const fullSyncInterval = setInterval(syncAllStats, 300000);

  // Return cleanup function
  return () => {
    window.removeEventListener('mindshift:points:update', handleStatsUpdate);
    window.removeEventListener('mindshift:streak:update', handleStatsUpdate);
    window.removeEventListener('mindshift:focus:session:complete', handleStatsUpdate);
    window.removeEventListener('mindshift:mbti:update', handleStatsUpdate);
    window.removeEventListener('mindshift:counters:update', handleStatsUpdate);
    clearInterval(fullSyncInterval);
  };
}
