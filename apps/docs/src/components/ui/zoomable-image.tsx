"use client";

import React, { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";

interface ZoomableImageProps {
  src: string;
  alt: string;
  legend?: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, legend, className }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsZoomed(false);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };

    if (isZoomed) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed]);

  return (
    <>
      {/* Thumbnail Image */}
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
            className
          )}
        />
        {/* Zoom Icon Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
        </div>
      </div>
      {legend && <p className="text-sm text-center -mt-4 font-light text-muted-foreground">{legend}</p>}

      {/* Zoomed Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseZoom}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Zoomed Image */}
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg border border-gray-300 dark:border-gray-600 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
