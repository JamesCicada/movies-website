export const fetchDetails = async (params: any, type: string) => {
  const id = params.movieId || params.showId;
  try {
    const res = await fetch(
      `/api/${type == "movie" ? "movie" : "tvShow"}?id=${id}`
    );
    if (!res.ok) throw new Error(`Couldn't fetch media data`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching media details:", error);
    throw new Error(`Couldn't fetch media data`);
  }
};
export const fetchCast = async (params: any, type: string) => {
  const id = params.movieId || params.showId;
  try {
    const res = await fetch(
      `/api/${type == "movie" ? "movieCast" : "tvShowCast"}?id=${id}`
    );
    if (!res.ok) throw new Error(`Couldn't fetch cast data`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching media cast:", error);
    throw new Error(`Couldn't fetch cast data`);
  }
};
export const fetchStream = async (
  params: any,
  type: string,
  ss?: number,
  ep?: number,
  mediaData?: any
) => {
  const id = params.movieId || params.showId;
  console.log(mediaData);

  try {
    const response = await fetch(
      `/api/stream?type=${type}&id=${id}&season_number=${
        ss || 1
      }&episode_number=${ep || 1}&mediaData=${mediaData || {}}`
    );
    if (!response.ok) throw new Error(`Couldn't fetch media stream`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching video stream:", error);
    throw new Error(`Couldn't fetch media stream`);
  }
};
