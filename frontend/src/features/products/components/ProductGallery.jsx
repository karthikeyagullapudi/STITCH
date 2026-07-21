import React, { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const ProductGallery = ({ images, title, collectionName }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const sliderRef = useRef(null);
  const thumbnailRefs = useRef([]);

  useEffect(() => {
    // Reset active index when images change (e.g. changing product)
    setActiveImageIndex(0);
  }, [images]);

  useEffect(() => {
    if (thumbnailRefs.current[activeImageIndex]) {
      thumbnailRefs.current[activeImageIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeImageIndex]);

  const handlePrevImage = () => {
    if (!images || images.length === 0) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!images || images.length === 0) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-panel flex items-center justify-center border border-line">
        <p className="text-muted text-sm">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[450px] mx-auto">
      {/* Constrained main image with hover magnifier */}
      <div className="group relative aspect-[3/4] w-full overflow-hidden bg-panel border border-line">
        <div
          className="relative w-full h-full overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={images[activeImageIndex]?.url || '/placeholder.jpg'}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-150 ease-out"
            style={{
              transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />
        </div>

        {/* Swipe Left and Right Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 border border-line text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-accent hover:text-ink hover:border-accent active:scale-90"
              aria-label="Previous image"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 border border-line text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-accent hover:text-ink hover:border-accent active:scale-90"
              aria-label="Next image"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {collectionName && (
          <span
            className={`${labelCaps} absolute left-4 top-4 z-10 bg-accent px-2 py-1 text-[10px] text-ink`}
          >
            {collectionName}
          </span>
        )}
      </div>

      {/* Slider to show all images with controls */}
      {images.length > 1 && (
        <div className="relative flex items-center px-8 border-t border-line/30 pt-4">
          {/* Scroll Left */}
          <button
            type="button"
            onClick={() => scrollSlider('left')}
            className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/75 border border-line text-paper backdrop-blur-sm transition-colors hover:bg-accent hover:text-ink hover:border-accent active:scale-90"
            aria-label="Scroll thumbnails left"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          {/* Scroller container */}
          <div
            ref={sliderRef}
            className="flex flex-grow gap-3 overflow-x-auto py-2 scroll-smooth scrollbar-none snap-x"
          >
            {images.map((img, i) => (
              <button
                key={img.url || i}
                ref={(el) => (thumbnailRefs.current[i] = el)}
                type="button"
                onClick={() => setActiveImageIndex(i)}
                className={`h-20 w-16 flex-shrink-0 overflow-hidden border bg-panel transition-all snap-start ${
                  i === activeImageIndex
                    ? 'border-accent scale-95 ring-1 ring-accent/30'
                    : 'border-line hover:border-accent'
                }`}
              >
                <img
                  src={img.url}
                  alt={`${title} view ${i + 1}`}
                  className={`h-full w-full object-cover transition-all ${
                    i === activeImageIndex ? '' : 'grayscale hover:grayscale-0'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Scroll Right */}
          <button
            type="button"
            onClick={() => scrollSlider('right')}
            className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/75 border border-line text-paper backdrop-blur-sm transition-colors hover:bg-accent hover:text-ink hover:border-accent active:scale-90"
            aria-label="Scroll thumbnails right"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
