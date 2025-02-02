import puppeteer from 'puppeteer';

export async function scrapeFirstImageUrl(url: string) {
  // Launch Puppeteer browser instance
  const browser = await puppeteer.launch({ headless: true }); // Change headless to false if you want to see the browser

  // Open a new page
  const page = await browser.newPage();

  // Set a custom user-agent to avoid detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

  // Optionally, set additional headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  });

  // Open the website
  await page.goto(url, { waitUntil: 'networkidle2' });


  // Extract the entire page content as text
  const pageContent = await page.content();

  // Use regex to find all URLs that end in .jpg
  const jpgUrls = pageContent.match(/https:\/\/[^"]*\.jpg/g);

  // Grab the first .jpg URL, if it exists
  const firstJpgUrl = jpgUrls ? jpgUrls[0] : null;

  if (firstJpgUrl) {
    console.log('First .jpg Image URL:', firstJpgUrl);
  } else {
    console.log('No .jpg image URL found.');
  }


  // // Wait for the content to load
  // await page.waitForSelector('body');

  // // Extract page content or take a screenshot
  // const pageContent = await page.content();
  // console.log(pageContent);

  // Close the browser
  await browser.close();

  return firstJpgUrl;
}
