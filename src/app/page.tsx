"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ResultDisplay from "../components/ResultDisplay";
import LoadingUI from "../components/LoadingUI";

export default function Home() {
  const [caption, setCaption] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{
    imageUrl: string;
    websiteUrl: string;
    price: number;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File, base64Image: string) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + Math.random() * 2;
        });
      }, 1000);

      // First API call
      const response = await fetch("/api/get_caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64_image: base64Image }),
      });

      if (!response.ok) {
        throw new Error("Caption generation failed");
      }

      const data = await response.json();
      console.log(data.caption);
      setCaption(data.caption);

      // Second API call
      const response2 = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption: data.caption }),
      });

      if (!response2.ok) {
        throw new Error("Upload failed");
      }

      const data2 = await response2.json();

      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);

      // Delay setting results for a smooth transition
      setTimeout(() => {
        setResults(data2.results);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Error: ${errorMessage}`);
      console.error("Image processing failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">AI Image Analyzer</h1>
      <ImageUploader onUpload={handleUpload} />
      {isLoading && <LoadingUI progress={progress} />}
      {error && (
        <div className="max-w-md mx-auto mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {results && <ResultDisplay results={results} />}
    </main>
  );
}
