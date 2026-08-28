import React, { useState } from 'react';
import { Hotel } from '../types';
import { Star, MapPin, Sparkles, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
  onQuickBook: (hotel: Hotel) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onSelect,
  onQuickBook
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const images = hotel.images && hotel.images.length > 0
    ? hotel.images
    : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      id={`hotel-card-${hotel.id}`}
      className="group relative bg-[#141414] rounded-sm overflow-hidden border border-[#262626] hover:border-[#C5A059] shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-black"
    >
      
      {/* Image Carousel Showcase */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a0a]">
        <img
          src={images[activeImgIndex]}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40 pointer-events-none"></div>

        {/* Star & Luxury Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <div className="px-2.5 py-1 rounded-sm bg-black/80 backdrop-blur-md border border-[#262626] text-[#C5A059] text-xs font-semibold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
            <span>{hotel.rating.toFixed(2)}</span>
            <span className="text-[#888888] text-[10px]">({hotel.reviewCount})</span>
          </div>
          {hotel.featured && (
            <div className="px-2.5 py-1 rounded-sm bg-[#C5A059] text-black text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 fill-black" />
              <span>Rare Stay</span>
            </div>
          )}
        </div>

        {/* Image Carousel Arrows */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="p-1.5 rounded-sm bg-black/70 backdrop-blur-md text-white hover:bg-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="p-1.5 rounded-sm bg-black/70 backdrop-blur-md text-white hover:bg-black transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Carousel indicator dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-sm transition-all ${
                  i === activeImgIndex ? 'w-4 bg-[#C5A059]' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hotel Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest text-[#C5A059] font-medium mb-1">
            <MapPin className="w-3 h-3" />
            <span>{hotel.city}, {hotel.country}</span>
          </div>

          {/* Hotel Name */}
          <h2 
            onClick={() => onSelect(hotel)}
            className="font-serif-luxury text-xl font-bold text-white group-hover:text-[#C5A059] transition-colors cursor-pointer line-clamp-1"
          >
            {hotel.name}
          </h2>

          {/* Tagline */}
          <p className="text-xs text-[#888888] font-light mt-1 line-clamp-2 leading-relaxed">
            {hotel.tagline}
          </p>

          {/* Signature Amenities Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-sm bg-[#0a0a0a] text-[#888888] text-[10px] uppercase tracking-wider border border-[#262626]"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-sm text-[10px] text-[#666666]">
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Call-To-Action Footer */}
        <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
          <div>
            <div className="text-[0.65rem] uppercase tracking-widest text-[#888888] font-medium">From</div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif-luxury text-xl font-bold text-[#C5A059]">${hotel.priceFrom.toLocaleString()}</span>
              <span className="text-xs text-[#888888] font-light">/ night</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`view-suites-btn-${hotel.id}`}
              onClick={() => onSelect(hotel)}
              className="px-3.5 py-2 rounded-sm text-xs font-medium uppercase tracking-wider bg-[#1a1a1a] hover:bg-[#262626] border border-[#262626] text-[#e0e0e0] hover:text-white transition-all flex items-center gap-1"
            >
              <span>Suites</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </button>
            <button
              id={`quick-reserve-btn-${hotel.id}`}
              onClick={() => onQuickBook(hotel)}
              className="px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest bg-[#C5A059] text-black hover:bg-[#d4af37] shadow-md transition-all"
            >
              Book
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
