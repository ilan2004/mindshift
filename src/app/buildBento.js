import { BENTO_ITEMS } from "./bentoRegistry";

export function buildBento(cluster, tone, excludeIds = [], limit = 8) {
  const set = new Set(excludeIds || []);
  const candidates = BENTO_ITEMS
    .filter((it) => !set.has(it.id))
    .map((it) => ({
      ...it,
      _score: (it.priority?.[cluster] ?? 0),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);

  // Inject tone prop for NudgeBox when present
  return candidates.map((it) => {
    if (it.id === "NudgeBox") {
      return { ...it, el: it.render({ tone }) };
    }
    return { ...it, el: it.render() };
  });
}

export function styleFor(item) {
  const base = item.size?.base || { c: 12, r: 1 };
  const md = item.size?.md;
  const lg = item.size?.lg;
  return {
    "--c-base": base.c,
    "--r-base": base.r,
    ...(md ? { "--c-md": md.c, "--r-md": md.r } : {}),
    ...(lg ? { "--c-lg": lg.c, "--r-lg": lg.r } : {}),
  };
}


