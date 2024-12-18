"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button, Skeleton, useDisclosure } from "@nextui-org/react";
import Player from "@/providers/player";
import { fetchCast, fetchDetails, fetchStream } from "@/functions/apiCalls";

export default function WatchMovie() {
  const params = useParams<{ movieId: string }>();
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false); // Tracks if the movie is liked
  const { isOpen, onOpenChange } = useDisclosure();
  const [textOpen, setTextOpen] = useState(false);
  const [error, setError] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(error) throw new Error()
  }, [error])

  // Fetch movie details
  useEffect(() => {
    fetchDetails(params, "movie")
      .then((data: any) => {
        setMovieDetails(data.data);
        document.title = `${data.data.title}`;
      })
      .catch(() => {
        setError(true);
      });
  }, [params?.movieId]);

  // Fetch cast information
  useEffect(() => {
    fetchCast(params, "movie")
      .then((data) => {
        setCast(data.data.cast);
      })
      .catch(() => {
        setError(true);
      });
  }, [params?.movieId]);

  // Fetch video stream
  useEffect(() => {
    fetchStream(params, "movie")
      .then((data) => {
        setVideoUrl(data);
      })
      .catch(() => {
        setError(true);
      });
  }, [params?.movieId]);

  const toggleLike = () => {
    const likedMovies = localStorage.getItem("likedMovies")?.split(",") || [];
    if (isLiked) {
      const updatedLikes = likedMovies.filter((id) => id !== params?.movieId);
      localStorage.setItem("likedMovies", updatedLikes.join(","));
    } else {
      likedMovies.push(params?.movieId!);
      localStorage.setItem("likedMovies", likedMovies.join(","));
    }
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    const likedMovies = localStorage.getItem("likedMovies")?.split(",") || [];
    setIsLiked(likedMovies.includes(params?.movieId!));
  }, [params?.movieId]);

  return (
    <div>
      {movieDetails ? (
        <div>
          {/* Video Player */}
          {videoUrl && (
            <div className="z-50" ref={playerRef}>
              <Player data={{ url: videoUrl, details: movieDetails }} />
            </div>
          )}

          {/* Movie Details Section */}
          <h1 className="mx-2 pt-3 mt-14 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            {movieDetails.title}
          </h1>
          <div className="flex mx-2 py-3">
            <Image
              loading="eager"
              className="hidden lg:flex rounded-xl object-contain"
              src={`https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}`}
              width={460}
              height={640}
              alt={`${movieDetails.name} Poster`}
            />
            <dl className="ml-4 max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
              <div className="flex flex-col pb-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Release Date
                </dt>
                <dd className="text-lg font-semibold">
                  {new Date(movieDetails.release_date).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex flex-col py-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Status
                </dt>
                <dd className="text-lg font-semibold">{movieDetails.status}</dd>
              </div>
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Genres
                </dt>
                <dd className="text-lg font-semibold">
                  {movieDetails.genres
                    .map((genre: any) => genre.name)
                    .join(", ")}
                </dd>
              </div>
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Studios
                </dt>
                <dd className="text-lg font-semibold">
                  {movieDetails.production_companies
                    .map((comp: any) => comp.name)
                    .join(", ")}
                </dd>
              </div>

              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Countries
                </dt>
                <dd className="text-lg font-semibold">
                  {movieDetails.production_countries
                    .map((country: any) => country.name)
                    .join(", ")}
                </dd>
              </div>
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Description
                </dt>
                <dd
                  className={`text-lg font-semibold ${
                    !textOpen ? "line-clamp-4" : ""
                  }`}
                >
                  {movieDetails.overview}
                </dd>
                <p
                  className="cursor-pointer text-blue-600"
                  onClick={() => {
                    setTextOpen(!textOpen);
                  }}
                >
                  {textOpen ? "Show less" : "Show more"}
                </p>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <Skeleton className="h-80" />
      )}
    </div>
  );
}
