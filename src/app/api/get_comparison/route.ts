import { NextResponse } from "next/server";
import { ComparisonResult } from "@/app/types";
import OpenAI from "openai";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
});

async function imageToBase64(imagePath: string): Promise<string> {
  const imageBuffer = await sharp(imagePath).jpeg().toBuffer();
  return Buffer.from(imageBuffer).toString("base64");
}

export async function POST(request: Request) {
  try {
    const { targetImagePath, foundImagePath } = await request.json();
    // Target image is already base64 encoded
    const targetBase64 = targetImagePath.split(",")[1]; // Remove data:image/xyz;base64, prefix if present

    // Fetch the found image from URL and convert to base64
    const foundImageResponse = await fetch(foundImagePath);
    const foundImageBuffer = await foundImageResponse.arrayBuffer();
    const foundBase64 = Buffer.from(foundImageBuffer).toString("base64");

    const prompt = `
      I'm showing you two clothing images. The first is what a customer requested,
      and the second is the closest match we found online.
      Please provide your analysis in the following format:

      MATCH PERCENTAGE: (provide a number between 0-100 representing how well these items match)

      MATCH EXPLANATION:
      (explain why this is a good match or not, being specific about colors, patterns, materials, and design elements)
    `;

    const message = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
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

    const comparison = formatComparison(
      message.choices[0].message.content || ""
    );

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Error in comparison:", error);
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

  return result;
}
