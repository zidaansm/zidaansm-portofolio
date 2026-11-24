import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { GitHubShowcaseSection } from "@/components/sections/GitHubShowcaseSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { getPortfolioData } from "@/lib/data/portfolio";
import { getGitHubShowcase } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPortfolioData();
  const githubData = await getGitHubShowcase(
    data.profile.github_url,
    data.profile.featured_github_repos
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AnalyticsTracker eventType="page_view" path="/" />
      <Navbar
        profile={data.profile}
        hasExperiences={data.experiences.length > 0}
      />
      <main className="flex-1">
        <HeroSection profile={data.profile} />
        <ProjectsSection projects={data.projects} />
        <CapabilitiesSection capabilities={data.capabilities} />
        <ExperienceSection experiences={data.experiences} />
        <GitHubShowcaseSection data={githubData} />
        <ContactSection profile={data.profile} />
      </main>
      <Footer profile={data.profile} />
    </div>
  );
}
