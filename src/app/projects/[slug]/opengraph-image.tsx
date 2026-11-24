import { getPublishedProjectBySlug } from "@/lib/data/portfolio";
import { renderBrutalistOgImage } from "@/lib/og/render-og-card";

export const alt = "Project Case Study — Zidan Seftino Mutaqin";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { project, profile } = await getPublishedProjectBySlug(slug);

  if (!project) {
    return renderBrutalistOgImage({
      eyebrow: `${profile.brand_name} // CASE STUDY`,
      badgeText: profile.role_en,
      title: profile.full_name,
      subtitle: profile.role_en,
      description: profile.headline_en,
      tags: ["Fullstack Web", "Mobile", "Systems"],
      footerRight: profile.location,
    });
  }

  return renderBrutalistOgImage({
    eyebrow: `CASE STUDY // ${project.category}`,
    badgeText: project.year,
    title: project.title_en,
    subtitle: `${profile.full_name} — ${project.role_en}`,
    description:
      project.summary_en.length > 155
        ? `${project.summary_en.slice(0, 152)}...`
        : project.summary_en,
    tags: project.tech_stack.slice(0, 5),
    footerRight: profile.brand_name,
  });
}
