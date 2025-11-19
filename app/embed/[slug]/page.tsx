import { notFound } from "next/navigation";
import GamePlayer from "@/app/components/GamePlayer";

async function getGame(slug: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/games/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.game;
}

export default async function EmbedGame(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const game = await getGame(params.slug);

  if (!game) {
    notFound();
  }

  return (
    <div className="w-full h-screen bg-black">
      <GamePlayer zipUrl={game.blob_url} title={game.title} slug={params.slug} />
    </div>
  );
}
