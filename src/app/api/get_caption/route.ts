import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
});

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON body
    const body = await req.json();
    const { base64_image } = body;

    // Validate input
    if (!base64_image || !base64_image.startsWith("data:image")) {
      return NextResponse.json({ error: "Invalid or missing base64 image" }, { status: 400 });
    }

    // Call OpenAI API for image captioning
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // GPT-4 Turbo supports vision-based tasks
      messages: [
        { role: "developer", content: "You are an AI that accurately describes the most prevalant clothing item in the image in three or less words, including colour and using the most commonly used casual term. If there is a zip that is a quarter way down from the top of the item, then it is most likely a quarter zip and not a turtleneck." },
        {
          role: "user",
          content: [
            { type: "text", text: "Accurately describe most prevalant item in the image." },
            { type: "image_url", image_url: { url: base64_image } },
          ],
        },
      ],
    });

    // Extract caption from the response
    const caption = response.choices[0]?.message?.content || "No caption generated";

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Error during POST request:", error);
    return NextResponse.json({ error: "Failed to process image caption" }, { status: 500 });
  }
}
