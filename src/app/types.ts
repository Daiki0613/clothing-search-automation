export interface ComparisonResult {
  match: number;
  match_explanation: string;
}

export interface ImageCaptionResult {
  imageUrl: string | null;
  websiteUrl: string;
  price: string;
}

export type Result = ImageCaptionResult & {
  match?: number;
  match_explanation?: string;
};
