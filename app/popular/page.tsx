"use client";
import { useEffect, useState } from "react";
import { CardComponent } from "@/components/card";
import { Tabs, Tab } from "@nextui-org/react";
import { FilmIcon, Tv2Icon } from "lucide-react";

export default function Popular() {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [type, setType] = useState<string>("movie");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (type === "movie" && movies.length === 0) {
        const res = await fetch("/api/movieTop");
        const resData = await res.json();
        setMovies(resData.data.results);
      } else if (type === "tv" && tvShows.length === 0) {
        const res = await fetch("/api/tvTop");
        const resData = await res.json();
        setTvShows(resData.data.results);
      }
      setLoading(false);
    }
    fetchData();
  }, [type, movies, tvShows]);

  const media = type === "movie" ? movies : tvShows;

  return (
    <>
      <div className="flex w-full flex-col items-center mb-5">
        <Tabs
          aria-label="Media Options"
          size="lg"
          color="secondary"
          variant="bordered"
          onSelectionChange={(key: any) => setType(key)}
        >
          <Tab
            key="movie"
            title={
              <div className="flex items-center space-x-2">
                <FilmIcon />
                <span>Movies</span>
              </div>
            }
          />
          <Tab
            key="tv"
            title={
              <div className="flex items-center space-x-2">
                <Tv2Icon />
                <span>TV Shows</span>
              </div>
            }
          />
        </Tabs>
      </div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {media.map((item: any) => (
            <CardComponent
              key={item.id}
              data={{ ...item, media_type: type }}
            />
          ))}
        </div>
      )}
    </>
  );
}
