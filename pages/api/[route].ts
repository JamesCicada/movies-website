import { NextApiRequest, NextApiResponse } from "next";

type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 60 * 60 * 1000 * 24; // 10 minutes in milliseconds

// Default settings
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req;
  const { route, id = "", page, season_number, episode_number } = query;

  const apiKey = process.env.APIKEY;

  if (!apiKey) {
    return res.status(500).json({ message: "API key not found" });
  }

  const buildCacheKey = () => `${route}-${JSON.stringify(query)}`;
  const fetchData = async () => {
    switch (route) {
      case "trending":
        const { type, duration } = query;
        return fetch(
          `https://api.themoviedb.org/3/trending/${type}/${
            duration || "day"
          }?language=en-US&page=${page || 1}&api_key=${apiKey}`
        );
      case "search":
        return fetch(
          `https://api.themoviedb.org/3/search/multi?query=${query.query}&include_adult=false&language=en-US&page=1&api_key=${apiKey}`
        );
      case "movie":
        return fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=external_ids,credits`
        );
      case "movieCast":
        return fetch(
          `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`
        );
      case "tvShow":
        return fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=external_ids,credits`
        );
      case "tvShowCast":
        return fetch(
          `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${apiKey}`
        );
      case "seasondata":
        return fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${season_number}?api_key=${apiKey}`
        );
      case "episodedata":
        return fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${season_number}/episode/${episode_number}?api_key=${apiKey}`
        );
      case "episodes":
        return fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${season_number}?api_key=${apiKey}`
        );
      case "tvTop":
        return fetch(
          `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${
            page || 1
          }&sort_by=popularity.desc&api_key=${apiKey}`
        );
      case "movieTop":
        return fetch(
          `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${
            page || 1
          }&sort_by=popularity.desc&api_key=${apiKey}`
        );
      case "person":
        return fetch(
          `https://api.themoviedb.org/3/person/${id}?append_to_response=movie_credits,tv_credits&api_key=${apiKey}`
        );
      case "advancedsearch": {
        const {
          adults,
          page = 1,
          sortby = "popularity.desc",
          type,
          keywords,
          genres,
          year,
          language = "en-US",
        } = query;

        let baseUrl;

        if (keywords) {
          // Use the search endpoint if a query is provided
          baseUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=${language}&page=${page}&query=${keywords}`;
          if (adults) baseUrl += `&include_adult=${adults}`;
        } else {
          // Use the discover endpoint if no query is provided
          baseUrl = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&language=${language}&page=${page}`;
          if (adults) baseUrl += `&include_adult=${adults}`;
          if (year) baseUrl += `&year=${year}`;
          if (genres) baseUrl += `&with_genres=${genres}`;
          if (sortby) baseUrl += `&sort_by=${sortby}`;
        }

        console.log("Generated URL: ", baseUrl);

        try {
          const response = await fetch(baseUrl);
          if (!response.ok) throw new Error("Failed to fetch data from TMDB.");
          const data = await response.json();

          return new Response(JSON.stringify({ success: true, ...data }), {
            status: 200,
          });
        } catch (error: any) {
          console.error(error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500 }
          );
        }
      }
      default:
        throw new Error("Invalid route");
    }
  };

  try {
    const cacheKey = buildCacheKey();
    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log("Cached data...");

      return res.json({ data: cache[cacheKey].data });
    }

    // Fetch new data if not in cache
    const response = await fetchData();
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json();

    // Store in cache
    cache[cacheKey] = { data, timestamp: now };

    res.json({ data });
  } catch (error: any) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: error.message });
  }
}
