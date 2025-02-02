"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ResultDisplay from "../components/ResultDisplay";

export default function Home() {
  const [caption, setCaption] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{
    imageUrl: string;
    websiteUrl: string;
    price: number;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File, base64Image: string) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch("/api/get_caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ Explicitly set JSON content type
        },
        body: JSON.stringify({ base64_image: base64Image }), // ✅ Send as JSON
      });
  
      if (!response.ok) {
        throw new Error("Upload failed");
      }
  
      const data = await response.json();
      console.log(data.caption);
      // setCaption(data.caption);

      try {
        const response2 = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // ✅ Explicitly set JSON content type
          },
          body: JSON.stringify({ caption: data.caption }), // ✅ Send as JSON
        });
  
        if (!response2.ok) {
          throw new Error("Upload failed");
        }
  
        const data2 = await response2.json();
        setResults(data2.results);
      } catch (err) {
        setError("An error occurred while uploading the image.");
        console.error(err);
      }
    } catch (err) {
      setError("An error occurred while uploading the image.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Image Upload and Analysis
      </h1>
      <ImageUploader onUpload={handleUpload} />
      {isLoading && <p className="text-center mt-4">Processing image...</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}
      {results && <ResultDisplay results={results} />}
    </main>
  );
}
