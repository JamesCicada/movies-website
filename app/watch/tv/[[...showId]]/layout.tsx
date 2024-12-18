import type { Metadata, ResolvingMetadata } from "next";
import Watch from "./page";
type Props = {
  params: Promise<{ showId: string }>;
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = (await params).showId;

  // fetch data
  const res = await fetch(
    `https://movies.jcwatch.com/api/tvShow?id=${(await params).showId}`
  ).then((res) => res.json());
  const show = res.data;
  // console.log(show);
  const title = show.name;
  const description = `Watch ${title} in high quality and without any annoying ads.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://movies.jcwatch.com/watch/tv/${id}`,
      type: "video.episode",
      images: [`https://image.tmdb.org/t/p/w500/${show.backdrop_path}`],
      siteName: "JC-Movies",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
