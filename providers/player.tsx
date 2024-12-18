"use client";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { useEffect, useRef, useState } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  useVideoQualityOptions,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { Menu } from "@vidstack/react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsMenuIcon,
} from "@vidstack/react/icons";
import { Image } from "@nextui-org/react";

export default function Player(data: any) {
  const [src, setSrc] = useState<number>();
  const [error, setError] = useState<boolean>(false);
  const volume =
    (typeof window !== "undefined" && localStorage.getItem("volume")) || "0.5";
  const { url, details } = data.data;

  const player = useRef<MediaPlayerInstance>(null);

  const link = url.url || url;

  const videoSource = url?.sources.map((s: any) => s.url) || "";
  const posterImage =
    `https://image.tmdb.org/t/p/original/${details.backdrop_path}` || "";

  // Ensure subtitles are unique and valid
  const subtitles: any[] = [];
  link.subtitles &&
    link.subtitles.forEach((sub: any) => {
      if (subtitles.find((x: any) => x.lang == sub.lang)) {
        sub.lang = `${sub.lang} - ${
          subtitles.filter((s) => s.lang == s.lang).length + 1
        }`;
        subtitles.push(sub);
      } else {
        subtitles.push(sub);
      }
    });
  const isTv = details.isTv || false;
  const episodes = details.episodes || null;
  const episodeNum = details.episode || null;
  const seasonNum = details.season || 1;
  useEffect(() => {
    setError(false);
    setSrc(0);
  }, [link, data]);
  function QualitySubmenu() {
    const options = useVideoQualityOptions();
    const currentQuality = options.selectedQuality?.height;
    const hint =
      options.selectedValue !== "auto" && currentQuality
        ? `${currentQuality}p`
        : `Auto${currentQuality ? ` (${currentQuality}p)` : ""}`;

    return (
      <Menu.Root>
        <SubmenuButton
          label="Quality"
          hint={hint}
          disabled={options.disabled}
          icon={<SettingsMenuIcon />}
        />
        <Menu.Content className="vds-menu-items">
          <Menu.RadioGroup
            className="vds-radio-group"
            value={options.selectedValue}
          >
            {options.map(({ label, value, bitrateText, select }) => (
              <Menu.Radio
                className="vds-radio"
                value={value}
                onSelect={select}
                key={value}
              >
                <CheckIcon className="vds-icon" />
                <span className="vds-radio-label">{label}</span>
                {bitrateText ? (
                  <span className="vds-radio-hint">{bitrateText}</span>
                ) : null}
              </Menu.Radio>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Root>
    );
  }

  interface SubmenuButtonProps {
    label: string;
    hint: string;
    disabled?: boolean;
    icon: React.ReactNode;
  }

  function SubmenuButton({ label, hint, icon, disabled }: SubmenuButtonProps) {
    return (
      <Menu.Button className="vds-menu-item" disabled={disabled}>
        <ChevronLeftIcon className="vds-menu-close-icon" />
        {icon}
        <span className="vds-menu-item-label">{label}</span>
        <span className="vds-menu-item-hint">{hint}</span>
        <ChevronRightIcon className="vds-menu-open-icon" />
      </Menu.Button>
    );
  }

  return (
    <>
      {!error ? (
        videoSource && (
          <div className="w-full my-2">
            <MediaPlayer
              className="w-full aspect-video bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4"
              title={`${details.title || details.name || "Unknown Title"} ${
                isTv ? ` - S${seasonNum} | EP${episodeNum} ` : ""
              }`}
              src={{
                src: `${videoSource[src as number]}`,
                type: "application/x-mpegurl",
              }}
              poster={posterImage}
              onError={() =>
                (src as number) + 1 < videoSource.length
                  ? setSrc((src as number) + 1)
                  : setError(true)
              }
              playsInline
              fullscreenOrientation="landscape"
              volume={Number(volume)}
              ref={player}
              onVolumeChange={({ volume }) =>
                localStorage.setItem("volume", `${volume}`)
              }
            >
              <MediaProvider>
                {subtitles.length > 0 &&
                  subtitles.map((s: any, index: any) => (
                    <Track
                      key={index}
                      kind="subtitles"
                      label={s.lang}
                      type="srt"
                      src={s.url}
                    />
                  ))}
                <Poster className="vds-poster" />
              </MediaProvider>
              <DefaultVideoLayout
                icons={defaultLayoutIcons}
                slots={{
                  beforeSettingsMenuStartItems: <QualitySubmenu />,
                  afterLoadButton: <span>Loading Source {src}</span>,
                }}
              />
            </MediaPlayer>
          </div>
        )
      ) : (
        <div className="flex flex-col w-full my-2 aspect-video items-center justify-center">
          <Image
            className="object-contain"
            src="/500-animated.gif"
            alt="Error 500"
          />
          <h1 className="text-red-600 text-4xl mt-2">
            There was an error loading this {isTv ? "Episode" : "Movie"}! Try
            again later.
          </h1>
          <p className="text-slate-500 text-2xl mt-2">
            {" "}
            If the error presists in other episodes/titles Please Report a Bug
            in our{" "}
            <a
              className="underline text-blue-500"
              href="https://discord.com/invite/GXu64738nD"
              target="_blank"
            >
              Discord Server
            </a>
          </p>
        </div>
      )}
    </>
  );
}
