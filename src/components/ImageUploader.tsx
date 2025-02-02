"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  onUpload: (file: File, base64: string) => void; // Pass base64 to parent
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);

      // Check file size and compress if larger than 10MB
      if (file.size > 10 * 1024 * 1024) {
        try {
          const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);

          // Set the compressed file preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(compressedFile);
          setSelectedFile(compressedFile); // Update selectedFile to the compressed file
        } catch (error) {
          console.error("Error during image compression:", error);
        }
      } else {
        // Handle normal file preview if no compression needed
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string; // Base64 string
        // Pass the file and base64 string to the parent component
        onUpload(selectedFile, base64Image);
      };
      reader.readAsDataURL(selectedFile); // Convert the selected file to base64
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
        </div>

        {preview && (
          <div className="mt-4">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              width={300}
              height={300}
              className="mx-auto rounded-lg object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={!selectedFile}
        >
          Upload and Analyze
        </button>
      </form>
    </div>
  );
}
