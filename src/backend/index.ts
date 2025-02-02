/**
 * 🤘 Welcome to Stagehand!
 *
 * You probably DON'T NEED TO BE IN THIS FILE
 *
 * You're probably instead looking for the main() function in main.ts
 *
 * This is run when you do npm run start; it just calls main()
 *
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config";
import { main } from "./main";
import { ImageCaptionResult } from "@/app/types";

export async function run(
  searchString: string,
  numberOfItems: number,
  website: string,
  sortBy: string
): Promise<ImageCaptionResult[]> {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  const page = stagehand.page;
  const context = stagehand.context;
  const results = await main({
    page,
    context,
    stagehand,
    searchString,
    numberOfItems,
    website,
    sortBy,
  });
  await stagehand.close();

  return results || [];
}
