import type { PortfolioPageData } from "../shared/portfolio.schema";

export const getPortfolio = async (): Promise<PortfolioPageData> => {
  const res = await fetch("/api/portfolio");
  if (!res.ok) {
    throw new Error("Failed to load portfolio data.");
  }
  return res.json();
};

export const savePortfolio = async ({ data }: { data: PortfolioPageData }): Promise<PortfolioPageData> => {
  const res = await fetch("/api/portfolio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to save portfolio data.");
  }
  return res.json();
};
