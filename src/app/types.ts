export interface ComparisonResult {
  match: number;
  match_explanation: string;
  title: string;
}

export interface ImageCaptionResult {
  imageUrl: string | null;
  websiteUrl: string;
  price: string;
}

export type Result = ImageCaptionResult & {
  match?: number;
  match_explanation?: string;
  title?: string;
};
