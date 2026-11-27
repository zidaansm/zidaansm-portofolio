import type { MetadataRoute } from "next";
import { getPortfolioData } from "@/lib/data/portfolio";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const data = await getPortfolioData();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/cv`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = data.projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
