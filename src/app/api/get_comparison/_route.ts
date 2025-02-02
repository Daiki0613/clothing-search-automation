// import { NextResponse } from "next/server";
// import { ComparisonResult } from "@/types/similarity";
// import Anthropic from "anthropic";
// import { encode } from "base64-js";
// import sharp from "sharp";

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY!,
// });

// async function imageToBase64(imagePath: string): Promise<string> {
//   const imageBuffer = await sharp(imagePath).jpeg().toBuffer();
//   return encode(imageBuffer).toString("base64");
// }

// export async function POST(request: Request) {
//   try {
//     const { targetImagePath, foundImagePath } = await request.json();

//     const targetBase64 = await imageToBase64(targetImagePath);
//     const foundBase64 = await imageToBase64(foundImagePath);

//     const prompt = `
//       I'm showing you two clothing images. The first is what a customer requested,
//       and the second is the closest match we found online.
//       Please provide your analysis in the following format:

//       SIMILARITIES:
//       - (list key similarities)

//       DIFFERENCES:
//       - (list notable differences)

//       MATCH EXPLANATION:
//       (explain why this is a good match)

//       CONCERNS:
//       - (list any potential concerns)

//       Please be specific about colors, patterns, materials, and design elements.
//     `;

//     const message = await anthropic.messages.create({
//       model: "claude-3-opus-20240229",
//       max_tokens: 1000,
//       messages: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: prompt,
//             },
//             {
//               type: "image",
//               source: {
//                 type: "base64",
//                 media_type: "image/jpeg",
//                 data: targetBase64,
//               },
//             },
//             {
//               type: "image",
//               source: {
//                 type: "base64",
//                 media_type: "image/jpeg",
//                 data: foundBase64,
//               },
//             },
//           ],
//         },
//       ],
//     });

//     const comparison = formatComparison(message.content);

//     return NextResponse.json({ comparison });
//   } catch (error) {
//     console.error("Error in comparison:", error);
//     return NextResponse.json(
//       { error: "Failed to generate comparison" },
//       { status: 500 }
//     );
//   }
// }

// function formatComparison(content: any): ComparisonResult {
//   const text = content[0].text;
//   const sections = text.split("\n\n");

//   const result: ComparisonResult = {
//     similarities: [],
//     differences: [],
//     match_explanation: "",
//     concerns: [],
//   };

//   for (const section of sections) {
//     const trimmed = section.trim();

//     if (trimmed.startsWith("SIMILARITIES:")) {
//       result.similarities = trimmed
//         .split("\n")
//         .slice(1)
//         .map((item) => item.trim().replace(/^-\s*/, ""))
//         .filter(Boolean);
//     } else if (trimmed.startsWith("DIFFERENCES:")) {
//       result.differences = trimmed
//         .split("\n")
//         .slice(1)
//         .map((item) => item.trim().replace(/^-\s*/, ""))
//         .filter(Boolean);
//     } else if (trimmed.startsWith("MATCH EXPLANATION:")) {
//       result.match_explanation = trimmed
//         .replace("MATCH EXPLANATION:", "")
//         .trim();
//     } else if (trimmed.startsWith("CONCERNS:")) {
//       result.concerns = trimmed
//         .split("\n")
//         .slice(1)
//         .map((item) => item.trim().replace(/^-\s*/, ""))
//         .filter(Boolean);
//     }
//   }

//   return result;
// }
