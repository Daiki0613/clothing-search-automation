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
import StagehandConfig from "./stagehand.config.js";
// import chalk from "chalk";
import { main } from "./main.js";
// import boxen from "boxen";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";

export async function run(search_string: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  // if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
  //   console.log(
  //     boxen(
  //       `View this session live in your browser: \n${chalk.blue(
  //         `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
  //       )}`,
  //       {
  //         title: "Browserbase",
  //         padding: 1,
  //         margin: 3,
  //       }
  //     )
  //   );
  // }

  console.log("Entered index.ts")

  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
    search_string,
  });
  await stagehand.close();
  
}

// run();
