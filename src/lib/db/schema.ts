import mongoose, { Schema, type Model } from "mongoose";

export type PostDoc = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  published: boolean;
};

const postSchema = new Schema<PostDoc>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type PortfolioDoc = {
  data: Record<string, unknown>;
};

// single-document collection; the whole page payload lives in `data`
const portfolioSchema = new Schema<PortfolioDoc>(
  {
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export const Post: Model<PostDoc> =
  (mongoose.models.Post as Model<PostDoc>) ?? mongoose.model<PostDoc>("Post", postSchema);

export const Portfolio: Model<PortfolioDoc> =
  (mongoose.models.Portfolio as Model<PortfolioDoc>) ??
  mongoose.model<PortfolioDoc>("Portfolio", portfolioSchema);
