"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingUIProps {
  progress: number;
}

const characters = ["🤖", "📷", "🖼️", "🔍", "💡", "🎨", "✨"];

interface Thought {
  id: number;
  text: string;
}

export default function LoadingUI({ progress }: LoadingUIProps) {
  const [currentCharacter, setCurrentCharacter] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacter((prev) => (prev + 1) % characters.length);
      setAnimationKey((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const thoughtsToAdd = [
      "Analyzing pixels...",
      "Identifying objects...",
      "Comparing to database...",
      "Calculating prices...",
      "Enhancing results...",
      "Double-checking accuracy...",
      "Preparing final report...",
    ];

    const addThought = (index: number) => {
      if (index < thoughtsToAdd.length) {
        setThoughts((prev) => [
          ...prev,
          { id: Date.now(), text: thoughtsToAdd[index] },
        ]);
        setTimeout(() => addThought(index + 1), Math.random() * 3000 + 2000);
      }
    };

    addThought(0);
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Analyzing Image
        </h2>
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
          <AnimatePresence>
            {thoughts.slice(-3).map((thought) => (
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
    </div>
  );
}
