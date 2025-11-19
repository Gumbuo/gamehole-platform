"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";

interface GamePlayerProps {
  zipUrl: string;
  title: string;
}

export default function GamePlayer({ zipUrl, title }: GamePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAndExtractGame();
  }, [zipUrl]);

  async function loadAndExtractGame() {
    try {
      setLoading(true);
      setError("");

      // Download the ZIP file
      const response = await fetch(zipUrl);
      if (!response.ok) {
        throw new Error("Failed to download game");
      }

      const zipBlob = await response.blob();
      const zip = await JSZip.loadAsync(zipBlob);

      // Find index.html
      let indexHtml = zip.file("index.html");
      if (!indexHtml) {
        throw new Error("No index.html found in game ZIP");
      }

      // Extract all files and create blob URLs
      const fileMap: Record<string, string> = {};
      const files = Object.keys(zip.files);

      for (const filename of files) {
        const file = zip.files[filename];
        if (!file.dir) {
          const blob = await file.async("blob");
          const blobUrl = URL.createObjectURL(blob);
          fileMap[filename] = blobUrl;
        }
      }

      // Get index.html content
      let htmlContent = await indexHtml.async("string");

      // Replace file paths with blob URLs
      // Handle both quoted and unquoted references
      Object.keys(fileMap).forEach((filename) => {
        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Replace various patterns: "filename", 'filename', src="filename", href="filename", etc.
        const patterns = [
          new RegExp(`["']${escapedFilename}["']`, "g"),
          new RegExp(`${escapedFilename}`, "g"),
        ];

        patterns.forEach((regex) => {
          htmlContent = htmlContent.replace(regex, (match) => {
            // Preserve quotes if they exist
            if (match.startsWith('"') || match.startsWith("'")) {
              return `"${fileMap[filename]}"`;
            }
            return fileMap[filename];
          });
        });
      });

      // Create a blob URL for the modified HTML
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const htmlUrl = URL.createObjectURL(htmlBlob);

      // Load in iframe
      if (iframeRef.current) {
        iframeRef.current.src = htmlUrl;
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Game load error:", err);
      setError(err.message || "Failed to load game");
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading {title}...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-red-400 text-center">
            <p className="text-xl mb-2">Failed to load game</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title={title}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
