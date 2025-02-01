import { type NextRequest, NextResponse } from "next/server";
import { run } from "../../../backend/index";

// Write function to call open AI given base64 image return caption

export async function POST(req: NextRequest) {
  const str = "cream quarter zip";
  run(str);

  // In a real application, you would process the uploaded image here
  // and generate results based on the image analysis

  // For this example, we'll return mock results
  const mockResults = [
    {
      imageUrl: "/placeholder.svg?height=300&width=300",
      websiteUrl: "https://example.com/product1",
      price: 29.99,
    },
    {
      imageUrl: "/placeholder.svg?height=300&width=300",
      websiteUrl: "https://example.com/product2",
      price: 39.99,
    },
    {
      imageUrl: "/placeholder.svg?height=300&width=300",
      websiteUrl: "https://example.com/product3",
      price: 49.99,
    },
  ];

  // Simulate a delay to mimic processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return NextResponse.json({ results: mockResults });
}
