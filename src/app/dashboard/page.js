"use client";

import PersonalityWelcome from "@/components/PersonalityWelcome";
import FocusMetricCard from "@/components/FocusMetricCard";
import QuickFocusLauncher from "@/components/QuickFocusLauncher";
import ActivityFeed from "@/components/ActivityFeed";
import SmartInsights from "@/components/SmartInsights";
import QuickActions from "@/components/QuickActions";
import AchievementShowcase from "@/components/AchievementShowcase";
import ProductivityInsights from "@/components/ProductivityInsights";
import SocialHub from "@/components/SocialHub";
import AnimatedCard from "@/components/AnimatedCard";
import FocusSummaryModal from "@/components/FocusSummaryModal";

export default function Dashboard() {
  return (
    <>
      <section className="min-h-screen py-6">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          {/* Welcome Header */}
          <PersonalityWelcome />
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AnimatedCard delay={0.2} animateOnScroll={false}>
              <FocusMetricCard metric="todayFocus" />
            </AnimatedCard>
            <AnimatedCard delay={0.3} animateOnScroll={false}>
              <FocusMetricCard metric="weeklyGoal" />
            </AnimatedCard>
            <AnimatedCard delay={0.4} animateOnScroll={false}>
              <FocusMetricCard metric="currentStreak" />
            </AnimatedCard>
            <AnimatedCard delay={0.5} animateOnScroll={false}>
              <FocusMetricCard metric="blockedSites" />
            </AnimatedCard>
          </div>

          {/* Quick Focus Launcher */}
          <AnimatedCard delay={0.6} animateOnScroll={false} className="mb-8">
            <QuickFocusLauncher />
          </AnimatedCard>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Analytics & Insights */}
            <div className="xl:col-span-2 space-y-8">
              <AnimatedCard delay={0.7} animateOnScroll={false}>
                <ProductivityInsights />
              </AnimatedCard>
              
              <AnimatedCard delay={0.8} animateOnScroll={false}>
                <SmartInsights />
              </AnimatedCard>
              
              <AnimatedCard delay={0.9} animateOnScroll={false}>
                <AchievementShowcase />
              </AnimatedCard>
            </div>

            {/* Right Column - Activity & Social */}
            <div className="space-y-8">
              <AnimatedCard delay={1.0} animateOnScroll={false}>
                <ActivityFeed />
              </AnimatedCard>
              
              <AnimatedCard delay={1.1} animateOnScroll={false}>
                <SocialHub />
              </AnimatedCard>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <AnimatedCard delay={1.2} animateOnScroll={false}>
            <div 
              className="rounded-xl p-6 text-center"
              style={{
                background: "linear-gradient(135deg, var(--token-3cf441d7-edfe-47fb-95dc-1899b0597681, #f9f8f4), var(--token-4c81cc5a-0ef3-499f-8b97-80de09631c0a, #ffff94))",
                border: "2px solid var(--color-green-900)",
                boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
              }}
            >
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2" style={{ fontFamily: "Tanker, sans-serif" }}>
                Ready to supercharge your productivity?
              </h3>
              <p className="text-neutral-600 text-sm mb-4">
                Your personalized focus journey starts with a single session. Every moment of focus builds toward your goals.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="nav-pill nav-pill--primary px-6 py-3">
                  Start Focus Session
                </button>
                <button className="nav-pill nav-pill--neutral px-6 py-3">
                  View Progress
                </button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* Floating Components */}
      <QuickActions />
      <FocusSummaryModal />
    </>
  );
}
