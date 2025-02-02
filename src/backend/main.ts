import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { number, z } from "zod";
import dotenv from "dotenv";
import { scrapeFirstImageUrl } from "./scrape_img_urls";

dotenv.config();

interface Item {
  websiteUrl: string;
  price: string;
  imageUrl?: string;
}

interface ExtractionResponse {
  data: {
    id: string;
    status: string;
    url: string;
    images: {
      url: string;
      id: string;
    }[];
    created_at: string;
    project_id: string;
  };
}

const API_KEY = process.env.API_KEY;

const extractFirstImage = async (items: Item[]) => {
  // const results: Record<string, { url: string } | null> = {};
  let results: Record<string, string | null> = {};

  for (const item of items) {
    try {
      console.log(`Extracting image for ${item.websiteUrl}`);
      // Start extraction
      // const startRes = await fetch('https://api.extract.pics/v0/extractions', {
      //   method: 'POST',
      //   headers: {
      //     Authorization: `Bearer ${API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ url: item.websiteUrl }),
      // });

      // const startJson: ExtractionResponse = await startRes.json();
      // if (!startRes.ok) {
      //   console.error(`Failed to start extraction for ${item.websiteUrl}`, startJson);
      //   results[item.websiteUrl] = null;
      //   continue;
      // }

      // const id = startJson.data.id;
      // let status = 'pending';
      // let images: { url: string; id: string }[] = [];

      // // Poll for extraction status
      // while (status !== 'done' && status !== 'error') {
      //   await new Promise((resolve) => setTimeout(resolve, 1000));

      //   const statusRes = await fetch(`https://api.extract.pics/v0/extractions/${id}`, {
      //     method: 'GET',
      //     headers: { Authorization: `Bearer ${API_KEY}` },
      //   });

      //   const statusJson: ExtractionResponse = await statusRes.json();
      //   status = statusJson.data.status;
      //   images = statusJson.data.images;
      // }

      // console.log(`Extraction for ${item.websiteUrl} is ${status}`);

      // // Find first image URL is a valid image URL
      // const productImageUrl = images.find((image) => image.url.match(/\.(jpeg|jpg|gif|png)$/))?.url;

      const productImageUrl = await scrapeFirstImageUrl(item.websiteUrl);

      console.log(productImageUrl);

      results[item.websiteUrl] = productImageUrl;
    } catch (error) {
      console.error(`Error processing ${item.websiteUrl}:`, error);
      results[item.websiteUrl] = null;
    }
  }

  const itemsWithImages = items.map((item) => ({
    websiteUrl: item.websiteUrl,
    price: item.price,
    imageUrl: results[item.websiteUrl],
  }));

  return itemsWithImages;
};

export async function main({
  page,
  context,
  stagehand,
  searchString,
  numberOfItems,
  website,
  sortBy,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
  searchString: string;
  numberOfItems: number;
  website: string;
  sortBy: string;
}) {
  console.log("Entered main.ts");

  // Start time
  const startTime = new Date();

  const url = website.toLowerCase() == "ALL" 
    ? "https://www.depop.com/" 
    : `https://www.${website}.com/`;

  await page
    .goto(url, {
      waitUntil: "load",
    })
    .then(() => {
      console.log(`\n\n\nNavigated to ${url}`, "Navigation");
    })
    .catch((error) => {
      console.error(`Failed to navigate to ${url}:`, error);
    });

  await page
    .act({
      action: `Submit '${searchString}' in the main search input field and click enter`,
    })
    .then(() => {
      console.log(
        `\n\n\nSearch for '${searchString}' submitted successfully`,
        "Search"
      );
    })
    .catch((error) => {
      console.error(`Failed to submit search for '${searchString}':`, error);
    });

  if (sortBy === "Cheapest") {
    await page.act({
      action: "Sort search results by price from low to high (ascending)",
    }).then(() => {
      console.log("Search results sorted by price successfully", "Sort");
    }).catch((error) => {
      console.error("Failed to sort search results by price:", error);
    });
  }

  const items = await page
    .extract({
      instruction:
        `Extract the product URL (and not just endpoint) and price for the first ${numberOfItems} items in the search results`,
      schema: z.object({
        items: z.array(
          z.object({
            websiteUrl: z.string(),
            price: z.string(),
          })
        ),
      }),
    })
    .then((details) => {
      details.items.forEach((item, index) => {
        // item.websiteUrl = url.substring(0, url.length - 1) + item.websiteUrl;
        console.log(
          `\n\n\nItem ${index + 1}:\nProduct URL: ${item.websiteUrl}\nPrice: ${
            item.price
          }`,
          "Extract"
        );
      });
      return details.items;
    });

  // End time
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  const timeDiffSeconds = timeDiff / 1000;
  console.log(
    `\n\n\nThe script took ${timeDiffSeconds} seconds to run`,
    "Time"
  );

  console.log(items);

  // Set items for debugging:
  // const testItems: Item[] = [
  //   {
  //     websiteUrl: 'https://www.depop.com/products/rewindtynevintage-polo-ralph-lauren-14/',
  //     price: '£10.00',
  //     imageUrl: 'https://d2h1pu99sxkfvn.cloudfront.net/b0/239/101/0/1d3b-4b3b-4b3b-4b3b-4b3b4b3b4b3b.jpg',
  //   },
  //   {
  //     websiteUrl: 'https://www.depop.com/products/jbswardrobe-chaps-jumper-cream-chaps-quarter-8002/',
  //     price: '£28.00',
  //   }
  // ]

  const itemsWithImageUrls = await extractFirstImage(items);

  console.log("*******ITEMS WITH IMAGE URLS*******");
  console.log(itemsWithImageUrls);

  return itemsWithImageUrls;
}
