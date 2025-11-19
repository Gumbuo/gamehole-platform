"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.gamehole.ink/play/${slug}`;
  const embedCode = `<iframe src="https://www.gamehole.ink/embed/${slug}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;

  const shareTwitter = () => {
    const text = `Check out ${title} on GameHole.ink!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareReddit = () => {
    window.open(
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      "_blank"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      alert("Embed code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy embed:", err);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
      <h3 className="text-xl font-bold text-white mb-4">Share This Game</h3>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={shareTwitter}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>🐦</span>
          <span>Twitter</span>
        </button>

        <button
          onClick={shareReddit}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>🔺</span>
          <span>Reddit</span>
        </button>

        <button
          onClick={copyLink}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>🔗</span>
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Embed Code:</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={embedCode}
            readOnly
            className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-300 text-sm font-mono"
          />
          <button
            onClick={copyEmbed}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-gray-600 transition-colors"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Embed this game on your website or blog
        </p>
      </div>
    </div>
  );
}
