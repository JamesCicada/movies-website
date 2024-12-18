"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { quotes } from "@/lib/quotes";
export default function Error({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState(quotes[0]);
  const pathname = usePathname();
  useEffect(() => {
    // Set a random quote when the component mounts
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);
  const reload = () => {
    console.log(pathname);
    reset();
  };
  return (
    <div className="flex flex-col items-center justify-center h-fit mt-10">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-xl mb-8">
        Don't worry, even the best movies have bloopers!
      </p>

      <div className="p-6 rounded-lg shadow-lg mb-8 max-w-md">
        <p className="text-lg italic mb-2">"{quote.text}"</p>
        <p className="text-right">- {quote.author}</p>
      </div>

      <div className="space-x-4">
        <Button onPress={() => reload()} color="primary" variant="bordered">
          Try again
        </Button>
        <Button
          onClick={() => router.push("/")}
          color="secondary"
          variant="light"
        >
          Go to homepage
        </Button>
      </div>

      {error && typeof error === "object" && "message" in error && (
        <p className="mt-4 text-red-400">Error details: {error.message}</p>
      )}
    </div>
  );
}
