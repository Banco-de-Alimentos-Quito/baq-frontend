"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images as ImagesIcon } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatioClass?: string;
  showThumbnails?: boolean;
}

export default function ImageCarousel({
  images,
  alt = "Imagen de la publicación",
  className = "",
  aspectRatioClass = "h-64 sm:h-80 md:h-96 lg:h-[440px]",
  showThumbnails = true,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = images.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (total <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, total]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  if (!images || images.length === 0) {
    return null;
  }

  // Single image display
  if (total === 1) {
    return (
      <div
        className={`relative ${aspectRatioClass} w-full max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={images[0]}
            alt=""
            fill
            className="object-cover blur-2xl opacity-15 scale-125"
            aria-hidden="true"
            priority
          />
        </div>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-contain relative z-10 p-2 sm:p-4"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full max-w-3xl mx-auto select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slide Frame */}
      <div
        className={`relative ${aspectRatioClass} w-full overflow-hidden rounded-2xl shadow-lg bg-white border border-gray-200/80 flex items-center justify-center`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ambient Blur Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src={images[currentIndex]}
            alt=""
            fill
            className="object-cover blur-2xl opacity-20 scale-125 transition-all duration-500 ease-out"
            aria-hidden="true"
          />
        </div>

        {/* Foreground Main Image with smooth transition */}
        <div className="relative w-full h-full flex items-center justify-center z-10 p-2 sm:p-4">
          <Image
            key={images[currentIndex]}
            src={images[currentIndex]}
            alt={`${alt} - Foto ${currentIndex + 1} de ${total}`}
            fill
            className="object-contain transition-opacity duration-300 ease-in-out"
            priority={currentIndex === 0}
          />
        </div>

        {/* Slide Counter Badge */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-semibold shadow-md">
          <ImagesIcon className="w-3.5 h-3.5 text-orange-400" />
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-orange-600 shadow-md flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Foto siguiente"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-orange-600 shadow-md flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators on bottom of the image */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Ir a foto ${idx + 1}`}
              className={`transition-all duration-300 rounded-full h-2 ${
                idx === currentIndex
                  ? "w-6 bg-orange-500 shadow-sm"
                  : "w-2 bg-white/70 hover:bg-white shadow-sm"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails strip below the carousel */}
      {showThumbnails && total > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 px-2 overflow-x-auto py-1">
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Seleccionar foto ${idx + 1}`}
                className={`relative w-14 h-10 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${
                  isActive
                    ? "border-orange-500 scale-105 shadow-md ring-2 ring-orange-200"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
