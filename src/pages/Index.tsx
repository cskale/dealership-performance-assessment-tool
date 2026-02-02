import { useState, useEffect } from "react";
import { HeroSection } from "@/components/Home/HeroSection";
import { StatsSection } from "@/components/Home/StatsSection";
import { AchievementsSection } from "@/components/Home/AchievementsSection";
import { FeaturesGrid } from "@/components/Home/FeaturesGrid";
import { CTASection } from "@/components/Home/CTASection";
import { Footer } from "@/components/Home/Footer";
import { HomeHeader } from "@/components/Navigation/HomeHeader";

const Index = () => {
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem('completed_assessment_results');
    setHasCompletedAssessment(!!completedResults);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader hasCompletedAssessment={hasCompletedAssessment} />
      <HeroSection hasCompletedAssessment={hasCompletedAssessment} />
      <StatsSection />
      <AchievementsSection />
      <FeaturesGrid />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
