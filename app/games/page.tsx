import Link from "next/link";

async function getAllGames() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/games`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.games || [];
}

export default async function GamesPage() {
  const games = await getAllGames();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Browse Games
          </h1>
          <p className="text-xl text-gray-300">
            Discover awesome games created by indie developers
          </p>
        </header>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-300 mb-6">
              No games available yet. Be the first to upload!
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-pink-600"
            >
              Upload Your Game
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game: any) => (
              <Link
                key={game.id}
                href={`/play/${game.slug}`}
                className="group bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500 hover:border-purple-400 transition-all hover:transform hover:scale-105"
              >
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400">
                  {game.title}
                </h3>
                {game.description && (
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {game.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  {game.author_avatar && (
                    <img
                      src={game.author_avatar}
                      alt={game.author_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{game.author_name}</span>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-400">
                  <span>👁️ {game.views} views</span>
                  <span>🎮 {game.plays} plays</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
