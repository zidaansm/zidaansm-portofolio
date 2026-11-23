import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { getPortfolioData } from "@/lib/data/portfolio";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPortfolioData();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        profile={data.profile}
        hasExperiences={data.experiences.length > 0}
      />
      <main className="flex-1">
        <HeroSection profile={data.profile} />
        <ProjectsSection projects={data.projects} />
        <CapabilitiesSection capabilities={data.capabilities} />
        <ExperienceSection experiences={data.experiences} />
        <ContactSection profile={data.profile} />
      </main>
      <Footer profile={data.profile} />
    </div>
  );
}
