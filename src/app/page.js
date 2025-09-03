import CharacterCard from "@/components/CharacterCard";
import QuestBoard from "@/components/QuestBoard";
import ProductivityGraph from "@/components/ProductivityGraph";
import FocusSummaryModal from "@/components/FocusSummaryModal";
import Badges from "@/components/Badges";
import NudgeBox from "@/components/NudgeBox";
import PeerStatusPanel from "@/components/PeerStatusPanel";
import CommunityChallenges from "@/components/CommunityChallenges";
import LeaderboardSection from "@/components/LeaderboardSection";

export default function Home() {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-start">
      <div className="w-full px-4 md:px-6 flex flex-col items-center gap-8">
        {/* Hero: 3-column with side components flanking Character */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-28 items-start">
          {/* Left side (compact panel) */}
          <div className="order-2 md:order-1 flex justify-center md:justify-start mt-12 md:mt-16 lg:mt-20 px-6 lg:px-8 md:-ml-4 lg:-ml-8">
            <div className="w-full max-w-md">
              <PeerStatusPanel />
            </div>
          </div>
          {/* Center: Character */}
          <div className="order-1 md:order-2 flex flex-col items-center gap-3">
            <CharacterCard title="ben" />
            <NudgeBox />
          </div>
          {/* Right side (compact panel) */}
          <div className="order-3 md:order-3 flex justify-center md:justify-end mt-12 md:mt-16 lg:mt-20 px-6 lg:px-8">
            <div className="w-full max-w-sm">
              <CommunityChallenges />
            </div>
          </div>
        </div>
        {/* Below hero only: Productivity Graph */}
        <div className="w-full">
          <ProductivityGraph />
        </div>
        {/* Leaderboard */}
        <div className="w-full">
          <LeaderboardSection />
        </div>
        {/* Full width: Quest Board */}
        <div className="w-full">
          <QuestBoard />
        </div>
        {/* Full width: Badges */}
        <div className="w-full">
          <Badges />
        </div>
      </div>
      <FocusSummaryModal />
    </section>
  );
}
