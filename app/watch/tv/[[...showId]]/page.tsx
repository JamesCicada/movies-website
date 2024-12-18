"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@/providers/player";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Skeleton,
  Switch,
  useDisclosure,
} from "@nextui-org/react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Image from "next/image";
import { AudioLines, TextIcon } from "lucide-react";
import { HeartIcon } from "@/components/icons";
import { CardComponent } from "@/components/card";
import { fetchCast, fetchDetails, fetchStream } from "@/functions/apiCalls";

export default function Watch() {
  const query = useSearchParams();
  const params = useParams<{ showId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false); // State to track if the media is liked
  const [init, setInit] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const [videoUrl, seshowIdeoUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    Number(query?.get("ss")) || 1
  );
  const [selectedEpisode, setSelectedEpisode] = useState<number>(
    Number(query?.get("ep")) || 1
  );
  const [textOpen, setTextOpen] = useState(false);
  const [reached, setReached] = useState<Number>(0);
  const [episodes, setEpisodes] = useState<any[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const paramss = new URLSearchParams(searchParams?.toString());

  useEffect(() => {
    if (error) throw new Error();
  }, [error]);
  const playerRef = useRef<HTMLDivElement>();
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine); // Load slim version of particles to reduce bundle size
    }).then(() => {
      setInit(true);
    });
  }, []);

  const checkIfLiked = () => {
    const likedMedia =
      typeof window !== undefined && localStorage.getItem("likedMedia");
    if (likedMedia) {
      return likedMedia.split(",").includes(tvDetails?.id || params?.showId);
    }
    return false;
  };
  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [tvDetails]);
  // Fetch cast information
  useEffect(() => {
    fetchCast(params, "tv").then((data) => {
      setCast(data.data.cast);
    });
  }, [params?.showId]);
  // Fetch TV details
  useEffect(() => {
    fetchDetails(params, "tv").then((data) => {
      setTvDetails(data.data);
      document.title = `${data.data.name}`;
    });
  }, [params?.showId]);
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const res = await fetch(
          `/api/episodes?id=${params?.showId}&season_number=${selectedSeason}`
        );
        const data = await res.json();
        setEpisodes(data.data.episodes);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEpisodes();
  }, [params?.showId, selectedSeason]);
  // Fetch video stream
  useEffect(() => {
    paramss.set("ep", String(selectedEpisode));
    paramss.set("ss", String(selectedSeason));
    if(!tvDetails) return
    setLoading(true);
    console.log(tvDetails);
    
    const data = {
      title: tvDetails.name,
      releaseYear: tvDetails.first_air_date.split('-')[0],
      tmdbId: tvDetails.id as string, 
      imdbId: tvDetails.external_ids.imdb_id,
      type: 'show',
      season: Number(selectedSeason),
      seasonId: tvDetails.seasons[selectedSeason - 1].id,
      episode: Number(selectedEpisode),
      episodeId: episodes![selectedEpisode - 1].id
    }
    console.log(data);
    
    fetchStream(params, "tv", selectedSeason, selectedEpisode, JSON.stringify(data))
      .then((data) => {
        seshowIdeoUrl(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(true);
      });
  }, [selectedSeason, selectedEpisode, episodes]);
  // useEffect: Store and Restore Last watched Episode.
  useEffect(() => {
    if (!params?.showId) return;
    // Primitive way to store Data (Too lazy to implement DB)

    // Retrieve the current data from localStorage
    let currentData = localStorage.getItem("watching");

    // If there's no existing data, initialize it as an empty object
    if (!currentData) {
      currentData = "{}";
    }

    // Parse the JSON data from localStorage
    const currentJson = JSON.parse(currentData);

    // Assume 'tvDetails' is a unique identifier for the current media and 'episode' is the current episode number
    const tvDetails = params?.showId; // Replace this with your actual media identifier logic

    // Get the stored episode for this media, if any
    const storedEpisode = currentJson[tvDetails]?.episode || 0;

    // Check if the current episode is bigger than the stored one
    if (selectedEpisode > storedEpisode) {
      // Update the JSON object with the current episode for the current media
      currentJson[tvDetails] = {
        episode: selectedEpisode,
        episodes: { [selectedEpisode]: 0 },
      };
      // Convert the updated JSON object back to a string
      const updatedData = JSON.stringify(currentJson);

      // Save the updated string back to localStorage
      localStorage.setItem("watching", updatedData);
    } else {
      if (selectedEpisode == storedEpisode) return;
      // If the current episode is not bigger, update the reached state
      setReached(storedEpisode);
      // onOpen();
    }
  }, [selectedEpisode, tvDetails]);
  return (
    <div>
      {tvDetails && (
        <>
          <div className="relative rounded-xl mb-5  max-h-96 overflow-hidden">
            <Image
              className="hidden lg:flex object-cover"
              alt={tvDetails.name + "'s Cover"}
              src={`https://image.tmdb.org/t/p/original/${tvDetails.backdrop_path}`}
              width={1920}
              height={500}
              priority={true}
            />
            <div className="absolute top-0 left-0 w-full h-full flex items-start justify-start mx-4 my-2">
              <h1 className="text-white w-fit md:text-9xl text-xl font-bold p-2 rounded-xl backdrop-blur-sm backdrop-brightness-90 backdrop-hue-rotate-30 line-clamp-1 overflow-hidden text-clip">
                {tvDetails.name.toUpperCase()}
              </h1>
            </div>
          </div>
          {videoUrl && (
            // @ts-ignore
            <div>
              <Modal
                backdrop="blur"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                radius="lg"
                classNames={{
                  body: "py-6",
                  backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                  base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                  header: "border-b-[1px] border-[#292f46]",
                  footer: "border-t-[1px] border-[#292f46]",
                  closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Continue where you left?
                      </ModalHeader>
                      <ModalBody>
                        <p>
                          You were watching{" "}
                          <strong>Episode: {Number(reached)}</strong> Do you
                          wish to continue from there?
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                        <Button
                          className="bg-[#6f4ef2] shadow-lg shadow-indigo-500/20"
                          onPress={() => {
                            onClose();
                            setSelectedEpisode(reached as number);
                          }}
                        >
                          Go To Episode {Number(reached)}
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              {!loading ? (
                <Player
                  ref={playerRef}
                  data={{
                    url: videoUrl,
                    details: {
                      ...tvDetails,
                      episodes,
                      season: selectedSeason,
                      episode: selectedEpisode,
                      isTv: true,
                    },
                  }}
                />
              ) : (
                <div className="w-full my-2 animate-pulse">
                  <div className="w-full aspect-video bg-gray-200 overflow-hidden rounded-md h-64"></div>
                </div>
              )}
              <div className="my-4">
                {/* Season Selector */}
                <h3 className="text-lg font-bold mb-2">Select Season</h3>
                <Select
                  startContent={<p>{selectedSeason}</p>}
                  selectionMode="single"
                  variant="bordered"
                  className="max-w-xs"
                  onSelectionChange={(keys: any) => {
                    const newSeason = Number(keys.currentKey);
                    setSelectedSeason(newSeason);
                    setSelectedEpisode(1); // Reset to first episode
                  }}
                >
                  {tvDetails.seasons.map((season: any) => (
                    <SelectItem key={season.season_number}>
                      Season {season.season_number}
                    </SelectItem>
                  ))}
                </Select>

                {/* Episodes for the Selected Season */}
                {episodes && (
                  <div className="mt-4">
                    <h3 className="text-lg font-bold mb-2">Episodes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {episodes.map((episode: any) => (
                        <Button
                          key={episode.episode_number}
                          variant={
                            episode.episode_number === selectedEpisode
                              ? "light"
                              : "bordered"
                          }
                          onPress={() =>
                            setSelectedEpisode(episode.episode_number)
                          }
                          className="w-full"
                        >
                          Episode {episode.episode_number}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {episodes && episodes.length > 0 && (
                <p className="text-gray-500 ml-2">
                  {`Episode ${selectedEpisode}: ${
                    episodes![`${selectedEpisode - 1}`].name
                  }`}
                </p>
              )}
              {isLiked !== null && (
                <Button
                  variant="faded"
                  startContent={
                    <div>
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
                  }
                  className="flex bg-transparent my-3 z-10 items-center justify-center"
                  onPress={(e) => {}}
                  name={`Add ${tvDetails.id} To Favorite`}
                >
                  Add to My-List
                </Button>
              )}
            </div>
          )}
          <h1 className="mx-2 pt-3 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            {tvDetails.name}
          </h1>
          <div className="flex mx-2 py-3">
            <Image
              loading="eager"
              className="hidden lg:flex rounded-xl object-contain"
              src={`https://image.tmdb.org/t/p/w500/${tvDetails.poster_path}`}
              width={460}
              height={640}
              alt={`${tvDetails.name} Poster`}
            />
            <dl className="ml-4 max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
              <div className="flex flex-col pb-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Release Date
                </dt>
                <dd className="text-lg font-semibold">
                  {new Date(tvDetails.first_air_date).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex flex-col py-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Status
                </dt>
                <dd className="text-lg font-semibold">{tvDetails.status}</dd>
              </div>
              {tvDetails.status === "Returning Series" && (
                <div className="flex flex-col py-3">
                  <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                    Airing Episode
                  </dt>
                  <dd className="text-lg font-semibold">
                    {tvDetails.number_of_episodes}
                  </dd>
                </div>
              )}
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Episodes
                </dt>
                <dd className="text-lg font-semibold">
                  {tvDetails.number_of_episodes}
                </dd>
              </div>
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Seasons
                </dt>
                <dd className="text-lg font-semibold">
                  {tvDetails.number_of_seasons}
                </dd>
              </div>
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Genres
                </dt>
                <dd className="text-lg font-semibold">
                  {tvDetails.genres.map((genre: any) => genre.name).join(", ")}
                </dd>
              </div>
              <div className="flex flex-col pt-3">
                <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                  Studios
                </dt>
                <dd className="text-lg font-semibold">
                  {tvDetails.networks
                    .map((network: any) => network.name)
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
                  {tvDetails.overview}
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
        </>
      )}
    </div>
  );
}
