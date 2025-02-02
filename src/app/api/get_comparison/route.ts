import { type NextRequest, NextResponse } from "next/server";
import { ComparisonResult } from "@/app/types";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON body
    const body = await req.json();
    const { targetImagePath, foundImagePath } = body;

    // Validate input
    if (!targetImagePath || !foundImagePath) {
      return NextResponse.json(
        { error: "Missing target or found image path" },
        { status: 400 }
      );
    }

    // Target image is already base64 encoded
    const targetBase64 = targetImagePath.split(",")[1];

    // Fetch the found image from URL and convert to base64
    const foundImageResponse = await fetch(foundImagePath);
    const foundImageBuffer = await foundImageResponse.arrayBuffer();
    const foundBase64 = Buffer.from(foundImageBuffer).toString("base64");

    // Call OpenAI API for image comparison
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I'm showing you two clothing images. The first is what a customer requested,
                and the second is the closest match we found online.
                Please provide your analysis in the following format:

                MATCH PERCENTAGE: (provide a number between 0-100 representing how well these items match)

                MATCH EXPLANATION:
                (explain why this is a good match or not, being specific about colors, patterns, materials, and design elements)`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${targetBase64}`,
              },
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${foundBase64}`,
              },
            },
          ],
        },
      ],
    });

    console.log("response", response);

    // Format the response
    const comparison = formatComparison(
      response.choices[0]?.message?.content || ""
    );

    return NextResponse.json({ result: comparison });
  } catch (error) {
    console.error("Error during POST request:", error);
    return NextResponse.json(
      { error: "Failed to generate comparison" },
      { status: 500 }
    );
  }
}

function formatComparison(content: string): ComparisonResult {
  const sections = content.split("\n\n");
  const result: ComparisonResult = {
    match: 0,
    match_explanation: "",
  };

  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.startsWith("MATCH PERCENTAGE:")) {
      const matchText = trimmed.replace("MATCH PERCENTAGE:", "").trim();
      const matchNumber = parseInt(matchText);
      result.match = isNaN(matchNumber) ? 0 : matchNumber;
    } else if (trimmed.startsWith("MATCH EXPLANATION:")) {
      result.match_explanation = trimmed
        .replace("MATCH EXPLANATION:", "")
        .trim();
    }
  }

  console.log("format comparison result", result);

  return result;
}
