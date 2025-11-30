'use client';

import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MediaViewerProps {
  images: string[];
  videoUrl?: string | null;
  initialIndex?: number;
  onClose: () => void;
}

export default function FullscreenMediaViewer({ 
  images, 
  videoUrl, 
  initialIndex = 0, 
  onClose 
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showVideo, setShowVideo] = useState(false);
  const totalItems = images.length + (videoUrl ? 1 : 0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowVideo(false);
    } else if (videoUrl) {
      setShowVideo(true);
    }
  };

  const handleNext = () => {
    if (showVideo) {
      setShowVideo(false);
      setCurrentIndex(0);
    } else if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (videoUrl) {
      setShowVideo(true);
    }
  };

  const getVideoUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-videos/${url}`;
  };

  const isYouTubeOrVimeo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-50 bg-white bg-opacity-10 px-4 py-2 rounded-full">
        <span className="text-white font-semibold">
          {showVideo ? 'Video' : `${currentIndex + 1} / ${images.length}`}
          {videoUrl && !showVideo && ` + Video`}
        </span>
      </div>

      {/* Navigation Buttons */}
      {totalItems > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 z-50 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all disabled:opacity-50"
            disabled={currentIndex === 0 && !showVideo}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 z-50 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all disabled:opacity-50"
            disabled={!videoUrl && currentIndex === images.length - 1}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Media Content */}
      <div 
        className="max-w-7xl max-h-[90vh] w-full mx-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {showVideo && videoUrl ? (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
            {isYouTubeOrVimeo(videoUrl) ? (
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                controls 
                autoPlay
                className="w-full h-full"
                preload="metadata"
              >
                <source src={getVideoUrl(videoUrl)} type="video/mp4" />
                <source src={getVideoUrl(videoUrl)} type="video/webm" />
                <source src={getVideoUrl(videoUrl)} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 bg-white bg-opacity-10 rounded-full">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
              setShowVideo(false);
            }}
            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index && !showVideo
                ? 'border-white scale-110'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
        {videoUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowVideo(true);
            }}
            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-black bg-opacity-50 flex items-center justify-center ${
              showVideo
                ? 'border-white scale-110'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-white text-2xl">▶</div>
          </button>
        )}
      </div>
    </div>
  );
}
