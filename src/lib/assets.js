// Asset mapping for MBTI + gender (M/W) to files under public/images
// Keep this as the single source of truth for character images.
// Updated to include ALL available images with correct formats
// M = Male, W = Women (Female)

export const ASSET_MAP = {
  // ENFJ - The Protagonist
  ENFJM: "/images/ENFJM.png",
  ENFJW: "/images/ENFJW.439Z.png",
  
  // ENFP - The Campaigner  
  ENFPM: "/images/ENFPM.357Z.png", 
  ENFPW: "/images/ENFPW.964Z.png",
  
  // ENTJ - The Commander
  ENTJM: "/images/ENTJM.jpeg",
  ENTJW: "/images/ENTJW.jpeg",
  
  // ENTP - The Debater
  ENTPM: "/images/ENTPM.364Z.png",
  ENTPW: "/images/ENTPW.982Z.png",
  
  // ESFJ - The Consul
  ESFJM: "/images/ESFJM.978Z.png",
  ESFJW: "/images/ESFJW.059Z.png",
  
  // ESFP - The Entertainer (UPDATED: now .png files)
  ESFPM: "/images/ESFPM.png",
  ESFPW: "/images/ESFPW.png",
  
  // ESTJ - The Executive (UPDATED: ESTJW now .png)
  ESTJM: "/images/ESTJM.161Z.png",
  ESTJW: "/images/ESTJW.png",
  
  // ESTP - The Entrepreneur
  ESTPM: "/images/ESTPM.258Z.png",
  ESTPW: "/images/ESTPW.031Z.png",
  
  // INFJ - The Advocate
  INFJM: "/images/INFJM.984Z.png",
  INFJW: "/images/INFJW.285Z.png",
  
  // INFP - The Mediator
  INFPM: "/images/INFPM.716Z.png",
  INFPW: "/images/INFPW.504Z.png",
  
  // INTJ - The Architect
  INTJM: "/images/INTJM.475Z.png",
  INTJW: "/images/INTJW.png",
  
  // INTP - The Thinker
  INTPM: "/images/INTPM.896Z.png",
  INTPW: "/images/INTPW.512Z.png",
  
  // ISFJ - The Protector
  ISFJM: "/images/ISFJM.077Z.png",
  ISFJW: "/images/ISFJW.211Z.png",
  
  // ISFP - The Adventurer
  ISFPM: "/images/ISFPM.696Z.png",
  ISFPW: "/images/ISFPW.131Z.png",
  
  // ISTJ - The Logistician (UPDATED: ISTJW now .png)
  ISTJM: "/images/ISTJM.502Z.png",
  ISTJW: "/images/ISTJW.png",
  
  // ISTP - The Virtuoso (UPDATED: ISTPW now .png)
  ISTPM: "/images/ISTPM.560Z.png",
  ISTPW: "/images/ISTPW.png",
};

export function getAssetPath(mbti, gender) {
  if (!mbti || !gender) return null;
  const key = `${mbti}${gender}`;
  
  // Primary lookup in asset map
  if (ASSET_MAP[key]) {
    return ASSET_MAP[key];
  }
  
  // Fallback: try common extensions in order of preference
  const fallbacks = [
    `/images/${key}.png`,
    `/images/${key}.jpeg`,
    `/images/${key}.jpg`
  ];
  
  // For development, we'll return the first fallback
  // In production, you might want to check if the file exists
  console.warn(`Asset not found in ASSET_MAP for ${key}, using fallback`);
  return fallbacks[0];
}

// Comprehensive video mapping for all available videos
// Maps MBTI + gender combinations to video files under public/videos
// M = Male, W = Women (Female)
export const VIDEO_MAP = {
  // ENFJ - The Protagonist
  ENFJM: "/videos/ENFJM.mp4",
  ENFJW: "/videos/ENFJW.439Z.mp4",
  
  // ENFP - The Campaigner
  ENFPW: "/videos/ENFPW.964Z.mp4",
  ENFPW2: "/videos/ENFPW.mp4", // Alternative ENFP Female video
  
  // ENTJ - The Commander
  ENTJW: "/videos/ENTJW.mp4",
  
  // ENTP - The Debater
  ENTPM: "/videos/ENTPM.364Z.mp4",
  ENTPW: "/videos/ENTPW.982Z.mp4",
  
  // ESFJ - The Consul
  ESFJM: "/videos/ESFJM.978Z.mp4",
  
  // ESFP - The Entertainer
  ESFPM: "/videos/ESFPM.mp4",
  ESFPW: "/videos/ESFPW.mp4",
  
  // ESTJ - The Executive (NEW: Added ESTJW)
  ESTJM: "/videos/ESTJM.mp4",
  ESTJW: "/videos/ESTJW.mp4",
  
  // ESTP - The Entrepreneur
  ESTPM: "/videos/ESTPM.258Z.mp4",
  ESTPW: "/videos/ESTPW.031Z.mp4",
  
  // INFJ - The Advocate
  INFJM: "/videos/INFJM.984Z.mp4",
  
  // INFP - The Mediator
  INFPM: "/videos/INFPM.mp4",
  INFPW: "/videos/INFPW.504Z.mp4",
  
  // INTJ - The Architect
  INTJM: "/videos/INTJM.mp4",
  
  // INTP - The Thinker (NEW: Added INTPW)
  INTPM: "/videos/INTPM.896Z.mp4",
  INTPW: "/videos/INTPW.512Z.mp4",
  
  // ISFJ - The Protector (NEW: Added ISFJM)
  ISFJM: "/videos/ISFJM.077Z.mp4",
  
  // ISFP - The Adventurer
  ISFPM: "/videos/ISFPM.696Z.mp4",
  ISFPW: "/videos/ISFPW.131Z.mp4",
  
  // ISTJ - The Logistician
  ISTJM: "/videos/ISTJM.502Z.mp4",
  ISTJW: "/videos/ISTJW.mp4",
  
  // ISTP - The Virtuoso
  ISTPM: "/videos/ISTPM.560Z.mp4",
  ISTPW: "/videos/ISTPW.mp4",
  
  // Special videos
  MOTHER: "/videos/mother.mp4",
};

export function getVideoPath(mbti, gender) {
  if (!mbti || !gender) return null;
  
  // Ensure uppercase for consistency
  const upperMbti = mbti.toUpperCase();
  const upperGender = gender.toUpperCase();
  const key = `${upperMbti}${upperGender}`;
  
  // Primary lookup in video map
  if (VIDEO_MAP[key]) {
    return VIDEO_MAP[key];
  }
  
  // Check for alternative versions (e.g., ENFPW2)
  const alt2Key = `${upperMbti}${upperGender}2`;
  if (VIDEO_MAP[alt2Key]) {
    return VIDEO_MAP[alt2Key];
  }
  
  // Fallback: try alternative gender if available (only if current gender not found)
  const altGender = upperGender === 'M' ? 'W' : 'M';
  const altKey = `${upperMbti}${altGender}`;
  if (VIDEO_MAP[altKey]) {
    console.info(`Using ${altGender} video for ${upperMbti} (${upperGender} not available)`);
    return VIDEO_MAP[altKey];
  }
  
  // Check alternative version of opposite gender
  const altAlt2Key = `${upperMbti}${altGender}2`;
  if (VIDEO_MAP[altAlt2Key]) {
    console.info(`Using ${altGender} alternative video for ${upperMbti} (${upperGender} not available)`);
    return VIDEO_MAP[altAlt2Key];
  }
  
  // No video available
  return null;
}

// Helper function to check if a video exists for a personality type
export function hasVideo(mbti, gender) {
  return getVideoPath(mbti, gender) !== null;
}

// Get all available video paths for a personality type
export function getAllVideoPathsForType(mbti) {
  const videos = [];
  const maleVideo = getVideoPath(mbti, 'M');
  const femaleVideo = getVideoPath(mbti, 'W');
  
  if (maleVideo) videos.push({ gender: 'male', path: maleVideo });
  if (femaleVideo) videos.push({ gender: 'female', path: femaleVideo });
  
  return videos;
}
