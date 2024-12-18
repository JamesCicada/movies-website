import { getvidsrc } from "@/functions/vidsrc";
import { getSource } from "@/functions/vidsrcip";
import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";
import {ScrapeMedia} from "@movie-web/providers"
import { getProviders } from "@/functions/providers";
type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
// Default settings
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req;
  const buildCacheKey = () => `${JSON.stringify(query)}`;
  try {
    const { id = "", type, season_number, episode_number, mediaData } = query;
    console.log(mediaData);
    const mData = JSON.parse(mediaData as string);
    const { title, releaseYear, episodeId, seasonId, season, episode } = mData;
    console.log(season_number, episode_number);

    let responseData: any;
    const fetchData = async () => {
      if (type == "movie") {
        responseData = await getvidsrc(id as string);
        const backupUrl = `https://2embed.wafflehacker.io/scrape`;
        const backupData = await fetch(`${backupUrl}?id=${id}`);
        if (backupData.ok) {
          const backObj = await backupData.json();
          const backup = {
            url: backObj.stream[0].playlist,
            quality: "1080",
            isM3U8: true,
          };
          responseData.sources[responseData.sources.length] = backup;
        }
      } else if (type == "tv") {
        responseData = await getvidsrc(
          id as string,
          season_number as string,
          episode_number as string
        );
        const backupData = await getProviders().runAll({
          media: {
            tmdbId: id as string,
            title: title,
            releaseYear: releaseYear,
            type: 'show',
            episode: {
                number: episode,
                tmdbId: episodeId,
            },
            season: {
                number: season,
                tmdbId: seasonId,
            },
          }
        }).catch((err) => {
          console.log(err);
          
        })
        console.log(backupData);
      }

      return responseData;
    };
    const cacheKey = buildCacheKey();
    // Check cache
    const now = Date.now();
    if (
      cache[cacheKey] &&
      now - cache[cacheKey].timestamp < CACHE_DURATION &&
      cache[cacheKey].data
    ) {
      console.log("Cached data...");

      return res.json({ ...cache[cacheKey].data });
    }

    // Fetch new data if not in cache
    const response = await fetchData();
    console.log(response);

    if (!response) {
      throw new Error(`Failed to fetch data.`);
    }
    const data = response;

    // Store in cache
    cache[cacheKey] = { data, timestamp: now };

    res.json({ ...data });
  } catch (error: any) {
    console.error("Error in API handler:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
// interface SearchMediaParams {
//   title?: string;
//   releaseYear?: number;
//   tmdbId?: string;
//   imdbId?: string;
//   type?: "movie" | "show";
//   season?: number;
//   episode?: number;
//   provider?: string;
//   token?: string;
// }
// async function searchMedia({
//   title,
//   releaseYear,
//   tmdbId,
//   imdbId,
//   type,
//   season,
//   episode,
//   provider = "orion",
//   token = "KZ6PjD9ZR0DfvlVlS4B3Qf8um57mjscqAH0Mw3XczPvLyrMYxBZLnCObtKp1U1BP%3A%3AR9PS6xqM56bCevrhh%2BGLkw%3D%3D",
// }: SearchMediaParams): Promise<any> {
//   const baseUrl = "https://api.whvx.net/search";

//   // Build the query object dynamically
//   const query: Record<string, any> = {};
//   if (title) query.title = title;
//   if (releaseYear) query.releaseYear = releaseYear;
//   if (tmdbId) query.tmdbId = tmdbId;
//   if (imdbId) query.imdbId = imdbId;
//   if (type) query.type = type;
//   if (season) query.season = season.toString();
//   if (episode) query.episode = episode.toString();

//   // Encode query as a JSON string and then URL encode it
//   const encodedQuery = encodeURIComponent(JSON.stringify(query));

//   // Build the full URL
//   const url = `${baseUrl}?query=${encodedQuery}&provider=${provider}&token=${token}`;

//   try {
//     // Send the GET request using axios
//     const response = await fetch(url,{
//       headers:{
//         "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
//         "Origin": "https://www.vidbinge.com"
//       }
//     });
//     console.log(response);

//     return response.json(); // Return the response data
//   } catch (error) {
//     console.error("Error fetching media data:", error);
//     throw new Error("Failed to fetch media data.");
//   }
// }
