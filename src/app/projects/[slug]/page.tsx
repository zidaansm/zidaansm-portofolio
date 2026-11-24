import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { PortfolioChatbot } from "@/components/chat/PortfolioChatbot";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectCaseStudyView } from "@/components/projects/ProjectCaseStudyView";
import { getPublishedProjectBySlug } from "@/lib/data/portfolio";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { project } = await getPublishedProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title_en,
    description: project.summary_en,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { project, prevProject, nextProject, profile, hasExperiences } =
    await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnalyticsTracker
        eventType="project_view"
        path={`/projects/${project.slug}`}
        projectSlug={project.slug}
      />
      <Navbar profile={profile} hasExperiences={hasExperiences} />
      <div className="flex-1">
        <ProjectCaseStudyView
          project={project}
          prevProject={prevProject}
          nextProject={nextProject}
        />
      </div>
      <Footer profile={profile} />
      <PortfolioChatbot
        currentPage={`/projects/${project.slug}`}
        isAiConfigured={Boolean(process.env.GEMINI_API_KEY?.trim())}
      />
    </div>
  );
}
