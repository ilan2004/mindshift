import ProductivityGraph from "@/components/ProductivityGraph";
import LeaderboardSection from "@/components/LeaderboardSection";
import QuestBoard from "@/components/QuestBoard";
import CommunityChallenges from "@/components/CommunityChallenges";
import Badges from "@/components/Badges";
import PeerStatusPanel from "@/components/PeerStatusPanel";
import NudgeBox from "@/components/NudgeBox";

// Registry of bento-capable components with cluster-aware priorities and preferred sizes
export const BENTO_ITEMS = [
  {
    id: "ProductivityGraph",
    render: () => (<ProductivityGraph />),
    size: { base: { c: 12, r: 1 }, md: { c: 8, r: 1 }, lg: { c: 8, r: 1 } },
    priority: { analysts: 10, explorers: 3, diplomats: 4, achievers: 5 },
  },
  {
    id: "LeaderboardSection",
    render: () => (<LeaderboardSection />),
    size: { base: { c: 12, r: 1 }, md: { c: 4, r: 1 }, lg: { c: 4, r: 1 } },
    priority: { analysts: 7, explorers: 4, diplomats: 3, achievers: 10 },
  },
  {
    id: "QuestBoard",
    render: () => (<QuestBoard />),
    size: { base: { c: 12, r: 1 }, md: { c: 8, r: 1 }, lg: { c: 8, r: 1 } },
    priority: { analysts: 5, explorers: 10, diplomats: 6, achievers: 6 },
  },
  {
    id: "CommunityChallenges",
    render: () => (<CommunityChallenges />),
    size: { base: { c: 12, r: 1 }, md: { c: 4, r: 1 }, lg: { c: 4, r: 1 } },
    priority: { analysts: 4, explorers: 8, diplomats: 9, achievers: 5 },
  },
  {
    id: "PeerStatusPanel",
    render: () => (<PeerStatusPanel />),
    size: { base: { c: 12, r: 1 }, md: { c: 4, r: 1 }, lg: { c: 4, r: 1 } },
    priority: { analysts: 6, explorers: 5, diplomats: 10, achievers: 7 },
  },
  {
    id: "Badges",
    render: () => (<Badges />),
    size: { base: { c: 6, r: 1 }, md: { c: 4, r: 1 }, lg: { c: 4, r: 1 } },
    priority: { analysts: 3, explorers: 6, diplomats: 5, achievers: 6 },
  },
  {
    id: "NudgeBox",
    // tone is set at call site as needed; fallback neutral here
    render: ({ tone = "neutral" } = {}) => (<NudgeBox tone={tone} />),
    size: { base: { c: 6, r: 1 }, md: { c: 4, r: 1 }, lg: { c: 4, r: 1 } },
    priority: { analysts: 4, explorers: 5, diplomats: 5, achievers: 4 },
  },
];


