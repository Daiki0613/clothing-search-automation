"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ResultDisplay from "../components/ResultDisplay";

export default function Home() {
  const [results, setResults] = useState<Array<{
    imageUrl: string;
    websiteUrl: string;
    price: number;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setResults(data.results);
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
