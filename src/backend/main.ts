/**
 * 🤘 Welcome to Stagehand!
 *
 * TO RUN THIS PROJECT:
 * ```
 * npm install
 * npm run start
 * ```
 *
 * To edit config, see `stagehand.config.ts`
 *
 * In this quickstart, we'll be automating a browser session to show you the power of Playwright and Stagehand's AI features.
 *
 * 1. Go to https://docs.browserbase.com/
 * 2. Use `extract` to find information about the quickstart
 * 3. Use `observe` to find the links under the 'Guides' section
 * 4. Use Playwright to click the first link. If it fails, use `act` to gracefully fallback to Stagehand AI.
 */

import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
// import chalk from "chalk";
// import boxen from "boxen";
import dotenv from "dotenv";

dotenv.config();


interface Item {
  productUrl: string;
  price: string;
}

interface ExtractionResponse {
  data: {
    id: string;
    status: string;
    url: string;
    images: string[];
    created_at: string;
    project_id: string;
  };
}

const API_KEY = process.env.API_KEY;

const extractFirstImage = async (items: Item[]) => {
  const results: Record<string, string | null> = {};

  for (const item of items) {
    try {
      console.log(`Extracting image for ${item.productUrl}`);
      // Start extraction
      const startRes = await fetch('https://api.extract.pics/v0/extractions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: item.productUrl }),
      });
      
      const startJson: ExtractionResponse = await startRes.json();
      if (!startRes.ok) {
        console.error(`Failed to start extraction for ${item.productUrl}`, startJson);
        results[item.productUrl] = null;
        continue;
      }
      
      const id = startJson.data.id;
      let status = 'pending';
      let images: string[] = [];
      
      // Poll for extraction status
      while (status !== 'done' && status !== 'error') {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusRes = await fetch(`https://api.extract.pics/v0/extractions/${id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        
        const statusJson: ExtractionResponse = await statusRes.json();
        status = statusJson.data.status;
        images = statusJson.data.images;
      }
      
      results[item.productUrl] = images.length > 0 ? images[0] : null;
    } catch (error) {
      console.error(`Error processing ${item.productUrl}:`, error);
      results[item.productUrl] = null;
    }
  }

  return results;
};


export async function main({
  page,
  context,
  stagehand,
  search_string
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
  search_string: string;
}) {

  console.log("Entered main.ts"); 

  // Start time
  const startTime = new Date();

  // const url = "https://www.vinted.co.uk/";
  const url = "https://www.depop.com/";

  await page.goto(url, {
    waitUntil: "load",
  }).then(() => {
    console.log(`\n\n\nNavigated to ${url}`, "Navigation");
  }).catch((error) => {
    console.error(`Failed to navigate to ${url}:`, error);
  });


  
  await page.act({
    action: `Submit '${search_string}' in the main search input field and click enter`,
  }).then(() => {
    console.log(`\n\n\nSearch for '${search_string}' submitted successfully`, "Search");
  }).catch((error) => {
    console.error(`Failed to submit search for '${search_string}':`, error);
  });


  // await page.act({
  //   action: "Sort search results by price from low to high (ascending)",
  // }).then(() => {
  //   announce("Search results sorted by price successfully", "Sort");
  // }).catch((error) => {
  //   console.error("Failed to sort search results by price:", error);
  // });


  // TODO: CHANGE TO 5 / 10 when testing properly 
  const items = await page.extract({
    instruction: "Extract the product URL and price for the first 2 items in the search results",
    schema: z.object({
      items: z.array(
        z.object({
          productUrl: z.string(),
          price: z.string(),
        })
      ),
    }),
  }).then((details) => {
    details.items.forEach((item, index) => {
      item.productUrl = url.substring(0, url.length - 1) + item.productUrl;
      console.log(
        `\n\n\nItem ${index + 1}:\nProduct URL: ${item.productUrl}\nPrice: ${item.price}`,
        "Extract"
      )
    });
    return details.items;
  });


  // End time
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  const timeDiffSeconds = timeDiff / 1000;
  console.log(`\n\n\nThe script took ${timeDiffSeconds} seconds to run`, "Time");

  
  console.log(items);

  // API Base URL
  const imageExtractorAPI = "https://api.extract.pics/v0"

  // Set items for debugging:
  const testItems: Item[] = [
    {
      productUrl: 'https://www.depop.com/products/rewindtynevintage-polo-ralph-lauren-14/',
      price: '£10.00'
    },
    {
      productUrl: 'https://www.depop.com/products/jbswardrobe-chaps-jumper-cream-chaps-quarter-8002/',
      price: '£28.00'
    }
  ]

  extractFirstImage(items).then(console.log);
}

// function announce(message: string, title?: string) {
//   console.log(
//     boxen(message, {
//       padding: 1,
//       margin: 3,
//       title: title || "Stagehand",
//     })
//   );
// }
