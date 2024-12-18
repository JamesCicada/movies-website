"use client";

import { Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useMediaQuery } from "@chakra-ui/react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { HeartFilledIcon, HeartIcon } from "@/components/icons";
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from "@/functions/jsonStorage";
interface CardData {
  image: string;
  title: any;
  id: string;
  totalEpisodes: number;
  episodes?: number;
  genre_ids?: string[];
  name?: string;
  poster_path: string;
  media_type: string;
}

interface CardComponentProps {
  data: CardData;
}

export const CardComponent = ({ data }: { data: any }) => {
  const [isLiked, setIsLiked] = useState(false); // State to track if the Movies is liked
  const [init, setInit] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const isMidScreen = useMediaQuery("(min-width: 800px)");
  const { id, totalEpisodes, episodes, genre_ids } = data;
  const router = useRouter();
  const maxLetters = isMidScreen ? 7 : 5;
  const validTitle = data.title || data.name;
  const genreNames = [
    {
      id: 28,
      name: "Action",
    },
    {
      id: 12,
      name: "Adventure",
    },
    {
      id: 16,
      name: "Animation",
    },
    {
      id: 35,
      name: "Comedy",
    },
    {
      id: 80,
      name: "Crime",
    },
    {
      id: 99,
      name: "Documentary",
    },
    {
      id: 18,
      name: "Drama",
    },
    {
      id: 10751,
      name: "Family",
    },
    {
      id: 14,
      name: "Fantasy",
    },
    {
      id: 36,
      name: "History",
    },
    {
      id: 27,
      name: "Horror",
    },
    {
      id: 10402,
      name: "Music",
    },
    {
      id: 9648,
      name: "Mystery",
    },
    {
      id: 10749,
      name: "Romance",
    },
    {
      id: 878,
      name: "Science Fiction",
    },
    {
      id: 10770,
      name: "TV Movie",
    },
    {
      id: 53,
      name: "Thriller",
    },
    {
      id: 10752,
      name: "War",
    },
    {
      id: 37,
      name: "Western",
    },
    {
      id: 10759,
      name: "Action & Adventure",
    },
    {
      id: 16,
      name: "Animation",
    },
    {
      id: 35,
      name: "Comedy",
    },
    {
      id: 80,
      name: "Crime",
    },
    {
      id: 99,
      name: "Documentary",
    },
    {
      id: 18,
      name: "Drama",
    },
    {
      id: 10751,
      name: "Family",
    },
    {
      id: 10762,
      name: "Kids",
    },
    {
      id: 9648,
      name: "Mystery",
    },
    {
      id: 10763,
      name: "News",
    },
    {
      id: 10764,
      name: "Reality",
    },
    {
      id: 10765,
      name: "Sci-Fi & Fantasy",
    },
    {
      id: 10766,
      name: "Soap",
    },
    {
      id: 10767,
      name: "Talk",
    },
    {
      id: 10768,
      name: "War & Politics",
    },
    {
      id: 37,
      name: "Western",
    },
  ];
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine); // Load slim version of particles to reduce bundle size
    }).then(() => {
      setInit(true);
    });
  }, []);

  const checkIfLiked = () => {
    const likedMedia = localStorage.getItem("likedMedia");
    if (likedMedia) {
      return readFromLocalStorage("likedMedia", [])
        .map((x: any) => x.id)
        .includes(id);
    }
    return false;
  };

  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [id]);

  const watchNow = useCallback(() => {
    router.push(`/watch/${data.media_type}/${id}`);
  }, [router, id]);

  const likeClicked = () => {
    let likedMedia = localStorage.getItem("likedMedia");
    if (!likedMedia) {
      localStorage.setItem("likedMedia", "");
    }
    let likedArray = readFromLocalStorage("likedMedia", []);
    console.log(likedArray);

    const alreadyLiked = likedArray?.map((x: any) => x.id).includes(id);
    if (!alreadyLiked) {
      setParticlesEnabled(true);
      setTimeout(() => setParticlesEnabled(false), 1000); // Enable particles for 1 second
    }
    if (alreadyLiked) {
      likedArray = likedArray.filter((animeId: any) => animeId !== id); // Remove Movies from liked list
    } else {
      likedArray.push({ id, type: data.media_type }); // Add Movies to liked list
    }

    // localStorage.setItem("likedMedia", likedArray.join(","));
    writeToLocalStorage("likedMedia", likedArray);
    setIsLiked(!alreadyLiked);
  };

  return (
    <Card
      className="pb-4 cursor-pointer shadow-1"
      isFooterBlurred
      isPressable
      onPress={watchNow}
    >
      <CardHeader className="pb-0 px-3 flex-col items-start">
        <small className="text-default-500 text-tiny">
          {data.media_type == "tv" ? `TV Show` : "Movie"}
        </small>
        <h4 className="font-bold text-large line-clamp-1 text-clip max-w-[90%] text-start">
          {validTitle}
        </h4>
        <Button
          isIconOnly
          className="flex bg-transparent absolute right-2 top-2 z-10 items-center justify-center"
          onPress={(e) => {
            likeClicked(); // Trigger the like action
          }}
          name={`Add ${validTitle} To Favorite`}
        >
          <div className="flex items-center justify-center w-full h-full relative">
            <HeartIcon
              className={`w-7 h-7 transition-all duration-300 ${
                isLiked ? "text-red-500" : "text-gray-300"
              }`}
              style={{
                color: isLiked ? "#FF0000" : "#DDDDDD",
                fill: isLiked ? "#FF0000" : "#DDDDDD",
              }}
            />
            {particlesEnabled && init && (
              <Particles
                id="tsparticles"
                className="absolute inset-0 pointer-events-none"
                options={{
                  fullScreen: false, // Disable fullscreen
                  particles: {
                    number: {
                      value: 30, // Reduce number of particles for burst effect
                    },
                    size: {
                      value: 2, // Particle size

                      //@ts-ignore
                      random: { enable: true, minimumValue: 2 },
                    },
                    move: {
                      enable: true,
                      speed: 4, // Speed up particles for quick burst
                      direction: "none",
                      outModes: {
                        default: "destroy", // Particles disappear after moving
                      },
                    },
                    color: {
                      value: "#FF0000", // Same color as heart icon
                    },
                    opacity: {
                      value: 1,
                      animation: {
                        enable: true,
                        speed: 1,
                        //@ts-ignore
                        minimumValue: 0, // Fade out particles
                      },
                    },
                    shape: {
                      type: "circle",
                    },
                  },
                }}
              />
            )}
          </div>
        </Button>
      </CardHeader>

      <Image
        alt={validTitle}
        className="object-cover rounded-xl h-[270px] md:h-[370px] px-2 pt-2"
        src={
          data.poster_path
            ? `https://image.tmdb.org/t/p/w500/${data.poster_path}`
            : `https://placeholder.pics/svg/500/DEDEDE/555555/${validTitle}`
        }
        loading="lazy"
        fetchPriority="auto"
        width={270}
        height={350}
      />

      {genre_ids && genre_ids.length > 0 && (
        <CardFooter className="bg-[#18181b] bg-opacity-75 hidden md:flex before:bg-white/10 border-white/20 border-1 overflow-hidden absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          {genre_ids.slice(0, 3).map((g: any, index: any) => (
            <p
              key={index}
              className="sm:text-tiny text-sm font-semibold mx-auto text-ellipsis"
            >
              {g.length > maxLetters
                ? `${genreNames.find((x: any) => x.id == g)?.name}...`
                : genreNames.find((x: any) => x.id == g)?.name}
            </p>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};
