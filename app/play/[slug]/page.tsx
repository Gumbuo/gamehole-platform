import { notFound } from "next/navigation";
import Link from "next/link";
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

export default async function PlayGame(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const game = await getGame(params.slug);

  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/games"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to Games
          </Link>
        </div>

        {/* Game Info */}
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
              {game.description && (
                <p className="text-gray-300 mb-4">{game.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>By {game.author_name}</span>
                <span>👁️ {game.views} views</span>
                <span>🎮 {game.plays} plays</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Player */}
        <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-purple-500">
          <div className="aspect-video bg-black rounded overflow-hidden">
            <GamePlayer zipUrl={game.blob_url} title={game.title} slug={params.slug} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <p className="text-gray-300">
            Click on the game above to start playing. Use your keyboard and mouse to control the game.
          </p>
        </div>
      </div>
    </div>
  );
}
