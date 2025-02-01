import { type NextRequest, NextResponse } from "next/server";
import { run as run_stagehand_app } from "../../../backend/index";

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON body
    const body = await req.json();
    const { caption } = body;
    // const searchString = "black quarter zip";
    
    console.log("Caption:", caption);
    
    const results = await run_stagehand_app(caption);

    return NextResponse.json({ results: results });
  } catch (error) {
    console.error("Error during POST request:", error);
    return NextResponse.json({ error: "Failed to process image caption" }, { status: 500 });
  }
}
