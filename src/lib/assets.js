// Asset mapping for MBTI + gender (M/W) to files under public/images
// Keep this as the single source of truth for character images.

export const ASSET_MAP = {
  ENFJM: "/images/ENFJM.png",
  ENFJW: "/images/ENFJW.439Z.png",
  ENFPM: "/images/ENFPM.357Z.png",
  ENFPW: "/images/ENFPW.964Z.png",
  ENTJM: "/images/ENTJM.jpeg",
  ENTJW: "/images/ENTJW.jpeg",
  ENTPM: "/images/ENTPM.364Z.png",
  ENTPW: "/images/ENTPW.982Z.png",
  ESFJM: "/images/ESFJM.978Z.png",
  ESFJW: "/images/ESFJW.059Z.png",
  ESFPM: "/images/ESFPM.jpeg",
  ESFPW: "/images/ESFPW.png",
  ESTJM: "/images/ESTJM.161Z.png",
  ESTJW: "/images/ESTJW.604Z.png",
  ESTPM: "/images/ESTPM.258Z.png",
  ESTPW: "/images/ESTPW.031Z.png",
  INFJM: "/images/INFJM.984Z.png",
  INFJW: "/images/INFJW.285Z.png",
  INFPM: "/images/INFPM.716Z.png",
  INFPW: "/images/INFPW.504Z.png",
  INTJM: "/images/INTJM.475Z.png",
  INTJW: "/images/INTJW.png",
  INTPM: "/images/INTPM.896Z.png",
  INTPW: "/images/INTPW.512Z.png",
  ISFJM: "/images/ISFJM.077Z.png",
  ISFJW: "/images/ISFJW.211Z.png",
  ISFPM: "/images/ISFPM.696Z.png",
  ISFPW: "/images/ISFPW.131Z.png",
  ISTJM: "/images/ISTJM.502Z.png",
  ISTJW: "/images/ISTJW.369Z.png",
  ISTPM: "/images/ISTPM.560Z.png",
  ISTPW: "/images/ISTPW.866Z.png",
};

export function getAssetPath(mbti, gender) {
  if (!mbti || !gender) return null;
  const key = `${mbti}${gender}`;
  if (ASSET_MAP[key]) return ASSET_MAP[key];
  // Fallback guesses by extension
  return `/images/${key}.png`;
}
