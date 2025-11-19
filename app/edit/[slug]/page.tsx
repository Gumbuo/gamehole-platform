"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditGame({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [slug, setSlug] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    credits: "",
  });

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (session && slug) {
      fetchGame();
    }
  }, [session, slug]);

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/${slug}`);
      const data = await res.json();

      if (res.ok && data.game) {
        setFormData({
          title: data.game.title || "",
          description: data.game.description || "",
          category: data.game.category || "Other",
          credits: data.game.credits || "",
        });
      } else {
        setError("Game not found");
      }
    } catch (err) {
      console.error("Failed to fetch game:", err);
      setError("Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/update-game", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: slug,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          credits: formData.credits,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update game");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please sign in to edit games</p>
          <Link
            href="/dashboard"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-purple-400 hover:text-purple-300"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg border border-purple-500">
            <h1 className="text-3xl font-bold text-white mb-6">Edit Game</h1>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
                Game updated successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Game Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  placeholder="My Awesome Game"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Describe your game..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Credits
                </label>
                <textarea
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Art by Jane Doe&#10;Music by John Smith&#10;Code by..."
                />
                <p className="text-gray-400 text-sm mt-1">
                  Credit pixel artists, musicians, and collaborators (optional)
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="RPG">RPG</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Platformer">Platformer</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Racing">Racing</option>
                  <option value="Sports">Sports</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Horror">Horror</option>
                  <option value="Casual">Casual</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
