"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

export default function Upload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    category: "Other",
    credits: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);
    setUploadProgress(0);

    if (!file) {
      setError("Please select a file to upload");
      setUploading(false);
      return;
    }

    try {
      // Upload file directly to Vercel Blob (client-side)
      setUploadProgress(10);

      // Add timestamp to filename to avoid conflicts
      const timestamp = Date.now();
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
      const uniqueFileName = `${fileName}-${timestamp}${fileExt}`;

      const blob = await upload(uniqueFileName, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: ({ loaded, total }) => {
          const progress = Math.round((loaded / total) * 80) + 10; // 10-90%
          setUploadProgress(progress);
        },
      });

      setUploadProgress(90);

      // Save game metadata to database
      const res = await fetch("/api/save-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          slug: formData.slug,
          category: formData.category,
          credits: formData.credits,
          blobUrl: blob.url,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to save game");
      }

      setUploadProgress(100);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please sign in to upload games</p>
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
            <h1 className="text-3xl font-bold text-white mb-6">Upload Game</h1>

            {/* Security Notice */}
            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-2xl">🔒</span>
                <div>
                  <h3 className="text-green-400 font-semibold mb-2">Your Game, Your Control</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• You have full control to edit or delete your uploaded games</li>
                    <li>• Your files are securely stored on enterprise cloud infrastructure</li>
                    <li>• We never sell, share, or modify your game files</li>
                    <li>• Our only moderation: removing sexually explicit content (to protect underage developers)</li>
                    <li>• Violent or offensive content is allowed - we respect community voting</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                {error}
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
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  placeholder="My Awesome Game"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  placeholder="my-awesome-game"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Your game will be available at: gamehole.ink/play/{formData.slug}
                </p>
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

              <div>
                <label className="block text-white font-semibold mb-2">
                  Game File (ZIP) *
                </label>
                <input
                  type="file"
                  required
                  accept=".zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Upload a ZIP file containing your game. Must include an index.html file.
                </p>
                {file && (
                  <p className="text-gray-300 text-sm mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {uploading && uploadProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? `Uploading... ${uploadProgress}%`
                  : "Upload Game"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
