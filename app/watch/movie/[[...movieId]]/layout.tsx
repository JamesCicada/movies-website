import type { Metadata, ResolvingMetadata } from "next";
import Watch from "./page";
type Props = {
  params: Promise<{ movieId: string }>;
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = (await params).movieId;

  // fetch data
  const res = await fetch(
    `https://movies.jcwatch.com/api/movie?id=${(await params).movieId}`
  ).then((res) => res.json());
  const movie = res.data;
  const title = movie.title;
  const description = `Watch ${title} in high quality and without any annoying ads.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://movies.jcwatch.com/watch/movie/${id}`,
      type: "video.movie",
      images: [`https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`],
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
