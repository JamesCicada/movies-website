"use client";
import {
  Card,
  Button,
  Input,
  CardBody,
  Link,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Play,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AutoComplete } from "@/components/autocomlplete";
import { ReminderModal } from "@/components/reminderModal";

export default function Home() {
  const router = useRouter();

  return (
    <div className={`min-h-screen transition-colors duration-300`}>
      <ReminderModal />
      <main className="flex flex-col mx-auto px-4 items-center justify-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">
          Welcome to JC-Movies
        </h1>
        <p className="text-lg sm:text-xl mb-8 text-center max-w-2xl mx-auto">
          Your ultimate destination for movies and TV shows. Discover, stream, and enjoy.
        </p>
        <div className="w-full max-w-md mx-auto h-1 bg-purple-600 rounded-full mb-8"></div>
        <div className="w-1/2 my-4 mb-8">
          <AutoComplete CallCloseMenu={() => {}}/>
        </div>
        <div className="flex justify-center space-x-4 mb-12">
          <Link href="/trending">
            <Button variant="bordered" className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Trending Titles</span>
            </Button>
          </Link>
          <Link href="/popular">
            <Button variant="bordered" className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Popular Titles</span>
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center mb-12">
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-300">
              1M+
            </p>
            <p className="text-sm sm:text-base">Titles</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-300">
              HD
            </p>
            <p className="text-sm sm:text-base">Quality</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-300">
              Ad-Free
            </p>
            <p className="text-sm sm:text-base">Experience</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-300">
              Multi-Device
            </p>
            <p className="text-sm sm:text-base">Streaming</p>
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Popular Genres
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Action",
              "Drama",
              "Comedy",
              "Thriller",
              "Romance",
              "Horror",
              "Sci-Fi",
              "Documentary",
            ].map((genre) => (
              <Button
                key={genre}
                onPress={() =>
                  router.push(`/advanced-search?genres=${genre}`)
                }
                isDisabled
                variant="bordered"
                className="w-full"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: "Search",
                description: "Find your favorite titles",
              },
              {
                icon: Play,
                title: "Stream",
                description: "Watch in high quality",
              },
              { icon: Heart, title: "Save", description: "Add to your watchlist" },
              {
                icon: Users,
                title: "Share",
                description: "Recommend to friends",
              },
            ].map((step, index) => (
              <Card key={index}>
                <CardBody className="flex flex-col items-center p-6">
                  <step.icon className="w-12 h-12 mb-4 text-purple-600" />
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
