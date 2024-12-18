"use client";
import { useEffect, useState } from "react";
import { CardComponent } from "@/components/card";
import {
  Tabs,
  Tab,
  Button,
} from "@nextui-org/react";
import { FilmIcon, Tv2Icon } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Trending() {
  const [mediaData, setMediaData] = useState<any[]>([]);
  const [type, setType] = useState("movie");
  const [dateRange, setDateRange] = useState("day");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchTrending = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/trending?type=${type}&duration=${dateRange}&page=${currentPage}`
      );
      const resData = await res.json();
      const newMedia = resData.data.results;

      if (currentPage === 1) {
        // Reset the data for a new fetch
        setMediaData(newMedia);
      } else {
        // Append new data to the existing list
        setMediaData((prev) => [...prev, ...newMedia]);
      }

      if (newMedia.length === 0) setHasMore(false);

      setPage(currentPage + 1); // Increment page only if the fetch was successful
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trending data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page when type or dateRange changes
    setHasMore(true); // Allow infinite scrolling to work
    fetchTrending(1); // Fetch fresh data for the new selection
  }, [type, dateRange]);

  const loadMore = () => {
    fetchTrending(page);
  };

  return (
    <>
      <h1 className="mb-10 pt-5 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Trending
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-5">
        <Tabs
          aria-label="Media Type"
          size="lg"
          color="secondary"
          variant="bordered"
          onSelectionChange={(key: any) => {
            setType(key);
          }}
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
        <Button onPress={() => setDateRange(dateRange === "day" ? "week" : "day")}>
          {dateRange === "day" ? "Day" : "Week"}
        </Button>
      </div>
      <InfiniteScroll
        dataLength={mediaData.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<p>Loading...</p>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mediaData.map((item: any, index: number) => (
            <CardComponent data={{ ...item, media_type: type }} key={index} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
}
