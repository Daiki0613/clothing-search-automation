"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChromeDinoGame from "./ChromeDinoGame";

interface LoadingUIProps {
  progress: number;
  caption: string;
}

const characters = ["🤖", "📷", "🖼️", "🔍", "💡", "🎨", "✨"];

interface Thought {
  id: number;
  text: string;
}

const thoughtsToAdd = [
  "Analysing pixels...",
  "Extracting features...",
  "Generating captions...",
  "Starting browser agent...",
  "Searching for matches...",
  "Minimising prices...",
  "Enhancing results...",
  "Double-checking accuracy...",
  "Preparing final report...",
];

export default function LoadingUI({ progress, caption }: LoadingUIProps) {
  const [currentCharacter, setCurrentCharacter] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentCaption, setCurrentCaption] = useState<Thought[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacter((prev) => (prev + 1) % characters.length);
      setAnimationKey((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset captions when caption prop changes
    setCurrentCaption([]);

    // Create a new thought with the updated caption
    const newThought = {
      id: Date.now(),
      text: caption,
    };

    // Add new thought with animation timing
    setTimeout(() => {
      setCurrentCaption((prev) => [...prev, newThought]);
    }, 300); // Small delay for smooth transition
  }, [caption]);

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Analysing Image</h2>
          <span className="text-xl font-semibold text-gray-800">{progress.toFixed(0)}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute top-0 left-0 h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <div className="text-center mb-6">
          <motion.div
            key={`${characters[currentCharacter]}-${animationKey}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="text-6xl inline-block"
          >
            {characters[currentCharacter]}
          </motion.div>
        </div>
        <div className="space-y-2 h-32 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {currentCaption.map((thought) => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-gray-600"
              >
                {thought.text}
                </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="bg-gray-100 p-4 text-center">
        <p className="text-sm text-gray-600">
          Tip: Try to guess what the next emoji will be!
        </p>
      </div>

      <ChromeDinoGame />
    </div>
  );
}
