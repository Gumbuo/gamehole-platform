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
          const data = await file.async("arraybuffer");
          // Determine MIME type based on extension
          let mimeType = "application/octet-stream";
          if (filename.endsWith(".js")) mimeType = "text/javascript";
          else if (filename.endsWith(".wasm")) mimeType = "application/wasm";
          else if (filename.endsWith(".html")) mimeType = "text/html";
          else if (filename.endsWith(".css")) mimeType = "text/css";
          else if (filename.endsWith(".png")) mimeType = "image/png";
          else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) mimeType = "image/jpeg";

          const blob = new Blob([data], { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);
          fileMap[filename] = blobUrl;
        }
      }

      // Get index.html content
      let htmlContent = await indexHtml.async("string");

      // Replace file references in HTML with blob URLs
      for (const [filename, blobUrl] of Object.entries(fileMap)) {
        if (filename === 'index.html') continue; // Skip the HTML file itself

        // Replace in src and href attributes
        const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        htmlContent = htmlContent.replace(
          new RegExp(`(src|href)=["']${escapedFilename}["']`, 'gi'),
          `$1="${blobUrl}"`
        );
        // Also handle unquoted or relative paths
        htmlContent = htmlContent.replace(
          new RegExp(`(src|href)=["'][^"']*\\/${escapedFilename}["']`, 'gi'),
          `$1="${blobUrl}"`
        );
      }

      // Inject fetch interceptor script at the beginning
      const interceptorScript = `
        <script>
          const originalFetch = window.fetch;
          const fileMap = ${JSON.stringify(fileMap)};

          window.fetch = function(url, options) {
            // Extract filename from URL
            const urlStr = typeof url === 'string' ? url : url.toString();
            const filename = urlStr.split('/').pop().split('?')[0];

            // If we have this file in our map, use the blob URL
            if (fileMap[filename]) {
              return originalFetch(fileMap[filename], options);
            }

            // Otherwise, use original fetch
            return originalFetch(url, options);
          };
        </script>
      `;

      // Insert interceptor right after <head> tag
      htmlContent = htmlContent.replace(/<head>/i, '<head>' + interceptorScript);

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
