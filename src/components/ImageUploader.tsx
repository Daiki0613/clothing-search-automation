"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImageUploaderProps {
  preview: string | null;
  setPreview: (preview: string | null) => void;
  isLoading: boolean;
  onUpload: (file: File, base64: string, formData: any) => void | Promise<void>;
  setResults: (results: any) => void;
  formData: any;
  setFormData: (formData: any) => void;
}

export default function ImageUploader({ 
  preview, 
  setPreview,
  isLoading,
  onUpload, 
  setResults,
  formData,
  setFormData,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, website: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, sortBy: value }))
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile, preview || "", formData);
    }
    setResults([]);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <AnimatePresence mode="wait">
                {!preview ? (
                  <motion.svg
                    key="upload-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    exit={{ scale: 0 }}
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
                  </motion.svg>
                ) : (
                  <motion.div
                    key="preview-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-10 h-10 mb-3 text-green-500"
                  >
                    ✅
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
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

        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                width={300}
                height={300}
                className="mx-auto rounded-lg object-cover shadow-md"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4"></div>

        <div className="space-y-2">
          <Label htmlFor="item-count" className="block text-sm font-medium text-gray-700">
            Number of Items (1-10)
          </Label>
          <Input
            id="item-count"
            name="itemCount"
            type="number"
            min="1"
            max="10"
            value={formData.itemCount}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="mt-4"></div>

        <div className="space-y-2">
          <Label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website to Search
          </Label>
          <Select value={formData.website} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a website" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Depop">Depop</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Ebay">eBay</SelectItem>
              <SelectItem value="Etsy">Etsy</SelectItem>
              <SelectItem value="ALL">ALL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4"></div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700">Search Preference</Label>
          <RadioGroup value={formData.sortBy} onValueChange={handleRadioChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Relevance" id="Relevance" />
              <Label htmlFor="Relevance">Relevance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cheapest" id="Cheapest" />
              <Label htmlFor="Cheapest">Cheapest</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-4"></div>

        <AnimatePresence>
          {(selectedFile || preview) && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              type="submit"
              className="w-full mt-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300 flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Analyse Image
            </motion.button>
          )}
        </AnimatePresence>

      </form>
    </div>
  );
}
