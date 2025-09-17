import { getSupabaseClient } from "./supabase";

/**
 * Profile service for syncing user profile data with Supabase
 * Handles both localStorage fallback and cloud sync
 */

// Get current authenticated user
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.warn('Error getting current user:', error);
    return null;
  }
}

// Fetch user profile from Supabase
export async function fetchUserProfile() {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  
  if (!supabase || !user) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username,gender,test_completed,mbti_type,points,streak,total_focus_minutes,bio,avatar_url')
      .eq('id', user.id)
      .single();
    
    if (error) {
      // Handle specific HTTP errors
      if (error.code === 'PGRST116' || error.message.includes('406')) {
        console.warn('Profile not found or access denied:', error.message);
      } else {
        console.warn('Error fetching profile:', error);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error fetching user profile:', error);
    // If it's a network or HTTP error, log more details
    if (error.response) {
      console.warn('HTTP Response:', error.response.status, error.response.statusText);
    }
    return null;
  }
}

// Save/update user profile to Supabase
export async function saveUserProfile(profileData) {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  
  if (!supabase || !user) return false;
  
  try {
    const profileWithId = {
      id: user.id,
      email: user.email,
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profileWithId, { onConflict: 'id' });
    
    if (error) {
      console.warn('Error saving profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error saving user profile:', error);
    return false;
  }
}

// Sync profile data between localStorage and Supabase
export async function syncProfileData() {
  const profile = await fetchUserProfile();
  if (!profile) return null;
  
  try {
    // Sync to localStorage
    if (profile.username) {
      localStorage.setItem('ms_display_name', profile.username);
      localStorage.setItem('nudge_profile_name', profile.username);
    }
    
    if (profile.gender) {
      localStorage.setItem('ms_gender', profile.gender === 'female' ? 'W' : 'M');
    }
    
    if (profile.avatar_url) {
      localStorage.setItem('nudge_profile_avatar_url', profile.avatar_url);
    }
    
    if (profile.bio) {
      localStorage.setItem('nudge_profile_bio', profile.bio);
    }
    
    if (profile.mbti_type) {
      localStorage.setItem('nudge_personality_type', profile.mbti_type);
    }
    
    // Sync stats if available and newer than local
    if (typeof profile.points === 'number') {
      const localPoints = Number(localStorage.getItem('nudge_points')) || 0;
      if (profile.points > localPoints) {
        localStorage.setItem('nudge_points', String(profile.points));
      }
    }
    
    if (typeof profile.streak === 'number') {
      const localStreak = Number(localStorage.getItem('nudge_streak')) || 0;
      if (profile.streak > localStreak) {
        localStorage.setItem('nudge_streak', String(profile.streak));
      }
    }
    
    if (typeof profile.total_focus_minutes === 'number') {
      const localTotal = Number(localStorage.getItem('nudge_total_focus_time')) || 0;
      if (profile.total_focus_minutes > localTotal) {
        localStorage.setItem('nudge_total_focus_time', String(profile.total_focus_minutes));
      }
    }
    
    return profile;
  } catch (error) {
    console.warn('Error syncing profile data:', error);
    return profile;
  }
}

// Sync local data to cloud (upload local state to Supabase)
export async function pushLocalDataToCloud() {
  try {
    const localData = {
      username: localStorage.getItem('ms_display_name') || localStorage.getItem('nudge_profile_name'),
      gender: localStorage.getItem('ms_gender') === 'W' ? 'female' : 'male',
      avatar_url: localStorage.getItem('nudge_profile_avatar_url'),
      bio: localStorage.getItem('nudge_profile_bio'),
      mbti_type: localStorage.getItem('nudge_personality_type'),
      points: Number(localStorage.getItem('nudge_points')) || 0,
      streak: Number(localStorage.getItem('nudge_streak')) || 0,
      total_focus_minutes: Number(localStorage.getItem('nudge_total_focus_time')) || 0,
      test_completed: localStorage.getItem('ms_intro_complete') === '1'
    };
    
    // Remove null/undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(localData).filter(([_, value]) => value != null && value !== '')
    );
    
    return await saveUserProfile(cleanedData);
  } catch (error) {
    console.warn('Error pushing local data to cloud:', error);
    return false;
  }
}

// Get profile data (tries Supabase first, falls back to localStorage)
export async function getProfileData() {
  // Try Supabase first
  const cloudProfile = await fetchUserProfile();
  if (cloudProfile) {
    await syncProfileData(); // Sync to localStorage
    return cloudProfile;
  }
  
  // Fallback to localStorage
  try {
    return {
      username: localStorage.getItem('ms_display_name') || localStorage.getItem('nudge_profile_name') || '',
      gender: localStorage.getItem('ms_gender') === 'W' ? 'female' : 'male',
      avatar_url: localStorage.getItem('nudge_profile_avatar_url') || '',
      bio: localStorage.getItem('nudge_profile_bio') || '',
      mbti_type: localStorage.getItem('nudge_personality_type') || '',
      points: Number(localStorage.getItem('nudge_points')) || 0,
      streak: Number(localStorage.getItem('nudge_streak')) || 0,
      total_focus_minutes: Number(localStorage.getItem('nudge_total_focus_time')) || 0,
      test_completed: localStorage.getItem('ms_intro_complete') === '1'
    };
  } catch (error) {
    console.warn('Error getting profile data:', error);
    return null;
  }
}

// Save profile field with dual sync (localStorage + Supabase)
export async function saveProfileField(field, value) {
  try {
    // Save to localStorage immediately (instant feedback)
    const localStorageKeys = {
      username: ['ms_display_name', 'nudge_profile_name'],
      gender: ['ms_gender'],
      avatar_url: ['nudge_profile_avatar_url'],
      bio: ['nudge_profile_bio'],
      mbti_type: ['nudge_personality_type'],
      points: ['nudge_points'],
      streak: ['nudge_streak'],
      total_focus_minutes: ['nudge_total_focus_time']
    };
    
    const keys = localStorageKeys[field] || [];
    for (const key of keys) {
      if (field === 'gender') {
        localStorage.setItem(key, value === 'female' ? 'W' : 'M');
      } else {
        localStorage.setItem(key, String(value));
      }
    }
    
    // Sync to Supabase in background
    const profileUpdate = { [field]: value };
    await saveUserProfile(profileUpdate);
    
    return true;
  } catch (error) {
    console.warn(`Error saving profile field ${field}:`, error);
    return false;
  }
}
