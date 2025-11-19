"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Action",
    "Adventure",
    "Puzzle",
    "RPG",
    "Strategy",
    "Platformer",
    "Shooter",
    "Racing",
    "Sports",
    "Simulation",
    "Horror",
    "Casual",
    "Other",
  ];

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchQuery, selectedCategory]);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    let filtered = games;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((game) => game.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description?.toLowerCase().includes(query) ||
          game.author_name?.toLowerCase().includes(query)
      );
    }

    setFilteredGames(filtered);
  };

  const getAverageRating = (game: any) => {
    if (game.rating_count === 0) return 0;
    return (game.rating_sum / game.rating_count).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-cyan-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-green-500 text-transparent bg-clip-text">
            Browse Games
          </h1>
          <p className="text-xl text-gray-300">
            Discover awesome games created by indie developers
          </p>
        </header>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-lg bg-gray-800 border border-cyan-500 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-center text-gray-400">
            {loading ? (
              "Loading games..."
            ) : (
              `Showing ${filteredGames.length} of ${games.length} games`
            )}
          </p>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-300 mb-6">
              {games.length === 0
                ? "No games available yet. Be the first to upload!"
                : "No games match your search."}
            </p>
            {games.length === 0 && (
              <Link
                href="/dashboard"
                className="inline-block bg-gradient-to-r from-cyan-500 to-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-cyan-600 hover:to-green-600"
              >
                Upload Your Game
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game: any) => (
              <Link
                key={game.id}
                href={`/play/${game.slug}`}
                className="group bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-cyan-500 hover:border-cyan-400 transition-all hover:transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 flex-1">
                    {game.title}
                  </h3>
                  {game.is_featured && (
                    <span className="text-xl" title="Featured">
                      ⭐
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500 bg-opacity-30 text-cyan-300 border border-cyan-500">
                    {game.category || "Other"}
                  </span>
                </div>

                {game.description && (
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {game.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                  {game.author_avatar && (
                    <img
                      src={game.author_avatar}
                      alt={game.author_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{game.author_name}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-400">
                  <span>👁️ {game.views} views</span>
                  <span>🎮 {game.plays} plays</span>
                  {game.rating_count > 0 && (
                    <span>
                      ⭐ {getAverageRating(game)} ({game.rating_count})
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
