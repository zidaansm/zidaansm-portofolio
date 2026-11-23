import type { Metadata } from "next";
import { PrintableCvView } from "@/components/cv/PrintableCvView";
import { getPortfolioData } from "@/lib/data/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description:
    "ATS-friendly printable Curriculum Vitae of Zidan Seftino Mutaqin — Fullstack Web Developer.",
};

export default async function CvPage() {
  const data = await getPortfolioData();
  return <PrintableCvView data={data} />;
}
