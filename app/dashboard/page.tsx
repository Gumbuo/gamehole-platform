"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserGames();
    }
  }, [session]);

  const fetchUserGames = async () => {
    try {
      const res = await fetch("/api/my-games");
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch("/api/delete-game", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete game");
      }

      // Refresh the games list
      fetchUserGames();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-gray-800 bg-opacity-50 p-8 rounded-lg border border-purple-500">
            <h1 className="text-3xl font-bold text-white mb-4">Developer Dashboard</h1>
            <p className="text-gray-300 mb-6">
              Sign in with GitHub to upload and manage your games.
            </p>
            <button
              onClick={() => signIn("github")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Developer Dashboard</h1>
            <p className="text-gray-300">Welcome back, {session.user?.name}!</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/upload"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600"
            >
              Upload New Game
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Games Grid */}
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
          <h2 className="text-2xl font-bold text-white mb-4">Your Games</h2>

          {loading ? (
            <p className="text-gray-300">Loading your games...</p>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">You haven't uploaded any games yet.</p>
              <Link
                href="/upload"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                Upload Your First Game
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game: any) => (
                <div
                  key={game.id}
                  className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {game.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>👁️ {game.views} views</span>
                    <span>🎮 {game.plays} plays</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/play/${game.slug}`}
                      className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(game.slug, game.title)}
                      className="flex-1 text-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
