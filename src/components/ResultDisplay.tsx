import Image from "next/image";

interface Result {
  imageUrl: string;
  websiteUrl: string;
  price: number;
}

interface ResultDisplayProps {
  results: Result[];
}

export default function ResultDisplay({ results }: ResultDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <Image
              src={result.imageUrl || "/placeholder.svg"}
              alt={`Result ${index + 1}`}
              width={300}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <a
                href={result.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Visit Website
              </a>
              <p className="mt-2 text-lg font-semibold text-black">
                {result.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
