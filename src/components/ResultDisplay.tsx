import Image from "next/image";
import { motion } from "framer-motion";
import { Result } from "@/app/types";

interface ResultDisplayProps {
  results: Result[];
}

export default function ResultDisplay({ results }: ResultDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Analysis Results
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <Image
                src={result.imageUrl || "/placeholder.svg"}
                alt={`Result ${index + 1}`}
                width={300}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-70 transition-opacity duration-300 flex items-end justify-center">
                <a
                  href={result.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium mb-4 px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors duration-300"
                >
                  View Product
                </a>
              </div>
            </div>
            <div className="p-4">
              <p className="text-lg font-semibold text-gray-800">
                {result.price}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Similar product found
              </p>
              {result.match !== undefined && (
                <p className="text-sm font-medium text-blue-600 mt-2">
                  Match: {result.match}%
                </p>
              )}
              {result.match_explanation && (
                <p className="text-xs text-gray-500 mt-1">
                  {result.match_explanation}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
