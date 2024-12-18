import { getvidsrc } from "@/functions/vidsrc";
import { NextApiRequest, NextApiResponse } from "next";

type CacheEntry = {
  data: any;
  timestamp: number;
};
const apiKey = process.env.APIKEY;
const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 60 * 60 * 1000 * 24; // 10 minutes in milliseconds
// Default settings
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req;
  let { ids, types } = query;
  const buildCacheKey = () => `${JSON.stringify(query)}`;
  const fetchData = async () => {
    const results: any = [];
    if (!ids) return;
    //@ts-ignore
    ids = ids.split(",");
    for (const id of ids!) {
      //@ts-ignore
      const type = types?.split(",")[ids.indexOf(id)];
      if (!type) return;
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=external_ids,credits`
      );
      console.log(res);
      let data = await res.json();
      data.media_type = type
      results.push(data);
    }
    return results;
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

    if (!response || response.length <= 0) {
      throw new Error(`Failed to fetch data.`);
    }
    const data = response;

    // Store in cache
    cache[cacheKey] = { data, timestamp: now };

    res.json({ data });
  } catch (error: any) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: error.message });
  }
}
