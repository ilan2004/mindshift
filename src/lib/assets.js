// Asset mapping for MBTI + gender (M/W) to files under public/images
// Keep this as the single source of truth for character images.
// Updated to include ALL available images from public/images

export const ASSET_MAP = {
  // ENFJ
  ENFJM: "/images/ENFJM.png",
  ENFJW: "/images/ENFJW.439Z.png",
  
  // ENFP
  ENFPM: "/images/ENFPM.357Z.png", 
  ENFPW: "/images/ENFPW.964Z.png",
  
  // ENTJ
  ENTJM: "/images/ENTJM.jpeg",
  ENTJW: "/images/ENTJW.jpeg",
  
  // ENTP
  ENTPM: "/images/ENTPM.364Z.png",
  ENTPW: "/images/ENTPW.982Z.png",
  
  // ESFJ
  ESFJM: "/images/ESFJM.978Z.png",
  ESFJW: "/images/ESFJW.059Z.png",
  
  // ESFP
  ESFPM: "/images/ESFPM.jpeg",
  ESFPW: "/images/ESFPW.png",
  
  // ESTJ
  ESTJM: "/images/ESTJM.161Z.png",
  ESTJW: "/images/ESTJW.604Z.png",
  
  // ESTP
  ESTPM: "/images/ESTPM.258Z.png",
  ESTPW: "/images/ESTPW.031Z.png",
  
  // INFJ
  INFJM: "/images/INFJM.984Z.png",
  INFJW: "/images/INFJW.285Z.png",
  
  // INFP
  INFPM: "/images/INFPM.716Z.png",
  INFPW: "/images/INFPW.504Z.png",
  
  // INTJ
  INTJM: "/images/INTJM.475Z.png",
  INTJW: "/images/INTJW.png",
  
  // INTP
  INTPM: "/images/INTPM.896Z.png",
  INTPW: "/images/INTPW.512Z.png",
  
  // ISFJ
  ISFJM: "/images/ISFJM.077Z.png",
  ISFJW: "/images/ISFJW.211Z.png",
  
  // ISFP
  ISFPM: "/images/ISFPM.696Z.png",
  ISFPW: "/images/ISFPW.131Z.png",
  
  // ISTJ
  ISTJM: "/images/ISTJM.502Z.png",
  ISTJW: "/images/ISTJW.369Z.png",
  
  // ISTP
  ISTPM: "/images/ISTPM.560Z.png",
  ISTPW: "/images/ISTPW.866Z.png",
  
  // Additional images found in directory
  ESFPM2: "/images/ESFPM.png", // Alternative ESFP Male
  ISTJW2: "/images/ISTJW.png",  // Alternative ISTJ Female
  ISTPW2: "/images/ISTPW.png",  // Alternative ISTP Female
};

export function getAssetPath(mbti, gender) {
  if (!mbti || !gender) return null;
  const key = `${mbti}${gender}`;
  if (ASSET_MAP[key]) return ASSET_MAP[key];
  // Fallback guesses by extension
  return `/images/${key}.png`;
}

// Comprehensive video mapping for all available videos
// Maps MBTI + gender combinations to video files under public/videos
export const VIDEO_MAP = {
  // ENFJ
  ENFJM: "/videos/ENFJM.mp4",
  ENFJW: "/videos/ENFJW.439Z.mp4",
  
  // ENFP
  ENFPW: "/videos/ENFPW.964Z.mp4",
  ENFPW2: "/videos/ENFPW.mp4", // Alternative ENFP Female video
  
  // ENTJ
  ENTJW: "/videos/ENTJW.mp4",
  
  // ENTP  
  ENTPM: "/videos/ENTPM.364Z.mp4",
  ENTPW: "/videos/ENTPW.982Z.mp4",
  
  // ESFJ
  ESFJM: "/videos/ESFJM.978Z.mp4",
  
  // ESFP
  ESFPM: "/videos/ESFPM.mp4",
  ESFPW: "/videos/ESFPW.mp4",
  
  // ESTJ
  ESTJM: "/videos/ESTJM.mp4",
  
  // ESTP
  ESTPM: "/videos/ESTPM.258Z.mp4",
  ESTPW: "/videos/ESTPW.031Z.mp4",
  
  // INFJ
  INFJM: "/videos/INFJM.984Z.mp4",
  
  // INFP
  INFPM: "/videos/INFPM.mp4",
  INFPW: "/videos/INFPW.504Z.mp4",
  
  // INTJ
  INTJM: "/videos/INTJM.mp4",
  
  // INTP
  INTPM: "/videos/INTPM.896Z.mp4",
  
  // ISFP
  ISFPM: "/videos/ISFPM.696Z.mp4",
  ISFPW: "/videos/ISFPW.131Z.mp4",
  
  // ISTJ
  ISTJM: "/videos/ISTJM.502Z.mp4",
  ISTJW: "/videos/ISTJW.mp4",
  
  // ISTP
  ISTPM: "/videos/ISTPM.560Z.mp4",
  ISTPW: "/videos/ISTPW.mp4",
  
  // Special videos
  CAP: "/videos/cap.mp4",
  MOTHER: "/videos/mother.mp4",
};

export function getVideoPath(mbti, gender) {
  if (!mbti || !gender) return null;
  const key = `${mbti}${gender}`;
  
  // Primary lookup in video map
  if (VIDEO_MAP[key]) {
    return VIDEO_MAP[key];
  }
  
  // Fallback: try alternative gender if available
  const altGender = gender === 'M' ? 'W' : 'M';
  const altKey = `${mbti}${altGender}`;
  if (VIDEO_MAP[altKey]) {
    return VIDEO_MAP[altKey];
  }
  
  // Check for alternative versions (e.g., ENFPW2)
  const alt2Key = `${mbti}${gender}2`;
  if (VIDEO_MAP[alt2Key]) {
    return VIDEO_MAP[alt2Key];
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
