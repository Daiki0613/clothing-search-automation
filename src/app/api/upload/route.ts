import { type NextRequest, NextResponse } from "next/server";
import { run as run_stagehand_app } from "../../../backend/index";

// Write function to call open AI given base64 image return caption

export async function POST(req: NextRequest) {
  const searchString = "black quarter zip";

  const results = await run_stagehand_app(searchString);

  return NextResponse.json({ results: results });
}
