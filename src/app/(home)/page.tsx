import { getPortfolio } from "@/lib/portfolio";
import PortfolioClient from "@/components/portfolio/PortfolioClient";
import type { Metadata } from "next";

// always render from the live database
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await getPortfolio();
  return {
    title: portfolio.seo.title,
    description: portfolio.seo.description,
    openGraph: {
      title: portfolio.seo.ogTitle,
      description: portfolio.seo.ogDescription,
    },
  };
}

export default async function HomePage() {
  const portfolio = await getPortfolio();
  return <PortfolioClient portfolio={portfolio} />;
}
