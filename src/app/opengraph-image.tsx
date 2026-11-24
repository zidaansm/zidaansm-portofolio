import { getPortfolioData } from "@/lib/data/portfolio";
import { renderBrutalistOgImage } from "@/lib/og/render-og-card";

export const alt = "Zidan Seftino Mutaqin — Fullstack Web Developer Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const { profile, capabilities } = await getPortfolioData();
  const topTags = capabilities
    .flatMap((cap) => cap.items)
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .slice(0, 5);

  return renderBrutalistOgImage({
    eyebrow: `${profile.brand_name} // PORTFOLIO`,
    badgeText: profile.is_available
      ? profile.availability_status_en
      : "PORTFOLIO",
    title: profile.full_name,
    subtitle: profile.role_en,
    description: profile.headline_en,
    tags:
      topTags.length > 0
        ? topTags
        : ["Laravel", "Next.js", "Kotlin", "Supabase", "Power BI"],
    footerRight: profile.location,
  });
}
