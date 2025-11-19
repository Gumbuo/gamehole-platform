"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchGames();
    }
  }, [session]);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/admin/games");
      if (res.status === 403) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setGames(data.games || []);
      setIsAdmin(true);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (slug: string) => {
    try {
      const res = await fetch("/api/admin/toggle-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        // Refresh games list
        fetchGames();
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch("/api/delete-game", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, adminOverride: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete game");
      }

      // Refresh games list
      fetchGames();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-cyan-900 to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-cyan-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please sign in to access admin panel</p>
          <Link
            href="/dashboard"
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-cyan-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Access Denied - Admin Only</p>
          <Link
            href="/dashboard"
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-cyan-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-300">Manage featured games and platform content</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-cyan-500">
          <h2 className="text-2xl font-bold text-white mb-4">All Games ({games.length})</h2>

          <div className="space-y-4">
            {games.map((game: any) => (
              <div
                key={game.id}
                className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                    {game.is_featured && (
                      <span className="text-xl" title="Featured">⭐</span>
                    )}
                    <span className="px-2 py-1 text-xs rounded bg-cyan-500 bg-opacity-30 text-cyan-300 border border-cyan-500">
                      {game.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{game.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>By {game.author_name}</span>
                    <span>👁️ {game.views} views</span>
                    <span>🎮 {game.plays} plays</span>
                    {game.rating_count > 0 && (
                      <span>⭐ {game.average_rating} ({game.rating_count})</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/play/${game.slug}`}
                    className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => toggleFeatured(game.slug)}
                    className={`px-4 py-2 rounded font-semibold transition-colors ${
                      game.is_featured
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-gray-600 hover:bg-gray-500 text-white"
                    }`}
                  >
                    {game.is_featured ? "⭐ Featured" : "Feature"}
                  </button>
                  <button
                    onClick={() => handleDelete(game.slug, game.title)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
