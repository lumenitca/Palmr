"use client";

import { useEffect, useState } from "react";
import { IconMaximize, IconX } from "@tabler/icons-react";
import { createPortal } from "react-dom";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleExpandClick = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFullscreen(false);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when fullscreen is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  return (
    <>
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <div className="relative group w-full h-full">
          <img
            src={src}
            alt={alt}
            className="object-contain w-full h-full rounded-md cursor-pointer"
            onClick={handleExpandClick}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-md">
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white text-black shadow-lg h-8 w-8"
              onClick={handleExpandClick}
            >
              <IconMaximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AspectRatio>

      {isFullscreen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={handleBackdropClick}
            style={{ margin: 0, padding: 0 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer absolute top-6 right-6 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20 h-10 w-10"
              onClick={handleCloseFullscreen}
            >
              <IconX className="h-6 w-6 cursor-pointer" />
            </Button>

            <img
              src={src}
              alt={alt}
              className="max-w-screen max-h-screen w-auto h-auto object-contain p-4"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "100vw", maxHeight: "100vh" }}
            />
          </div>,
          document.body
        )}
    </>
  );
}
