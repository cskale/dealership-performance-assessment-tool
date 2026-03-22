import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { HeroSection } from "@/components/Home/HeroSection";
import { StatsSection } from "@/components/Home/StatsSection";
import { AchievementsSection } from "@/components/Home/AchievementsSection";
import { FeaturesGrid } from "@/components/Home/FeaturesGrid";
import { CTASection } from "@/components/Home/CTASection";
import { Footer } from "@/components/Home/Footer";
import { HomeHeader } from "@/components/Navigation/HomeHeader";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem('completed_assessment_results');
    setHasCompletedAssessment(!!completedResults);
  }, []);

  // Authenticated users go straight to dashboard
  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

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
