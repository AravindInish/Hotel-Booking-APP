import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { SearchFilters } from '../types';

interface HeroSearchProps {
  filters?: SearchFilters;
  initialFilters?: SearchFilters;
  onSearch: (updated: Partial<SearchFilters>) => void;
  totalHotelsCount?: number;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  filters,
  initialFilters,
  onSearch,
  totalHotelsCount
}) => {
  const activeFilters = filters || initialFilters || {
    destination: '',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-19',
    guests: 2,
    roomType: 'all',
    minPrice: 0,
    maxPrice: 5000,
    amenities: []
  };

  const [destination, setDestination] = useState(activeFilters.destination || '');
  const [checkInDate, setCheckInDate] = useState(activeFilters.checkInDate || '2026-09-15');
  const [checkOutDate, setCheckOutDate] = useState(activeFilters.checkOutDate || '2026-09-19');
  const [guests, setGuests] = useState(activeFilters.guests || 2);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>(activeFilters.stars || []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(activeFilters.amenities || []);
  const [maxPrice, setMaxPrice] = useState(activeFilters.maxPrice || 3000);

  const POPULAR_DESTINATIONS = [
    { name: 'Paris', country: 'France', tag: 'Haute Elegance' },
    { name: 'Kyoto', country: 'Japan', tag: 'Sacred Forest' },
    { name: 'Positano', country: 'Amalfi Coast', tag: 'Cliffside' },
    { name: 'Dubai', country: 'UAE', tag: 'Skyline Suites' },
    { name: 'North Ari Atoll', country: 'Maldives', tag: 'Overwater' },
    { name: 'St. Moritz', country: 'Switzerland', tag: 'Alpine Ski' }
  ];

  const AMENITY_TAGS = [
    'Michelin 3-Star Dining',
    'Private Guerlain Spa',
    '24/7 Butler Service',
    'Natural Onsen Baths',
    'Cliffside Saltwater Pool',
    'Private White Sand Beach',
    'Overwater Glass Floor',
    'Direct Ski-in / Ski-out'
  ];

  const handleApplySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      destination,
      checkInDate,
      checkOutDate,
      guests,
      stars: selectedStars,
      amenities: selectedAmenities,
      maxPrice
    });
  };

  const handleQuickDestination = (dest: string) => {
    setDestination(dest);
    onSearch({ destination: dest });
  };

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    onSearch({ amenities: updated });
  };

  const clearAllFilters = () => {
    setDestination('');
    setSelectedStars([]);
    setSelectedAmenities([]);
    setMaxPrice(3000);
    onSearch({
      destination: '',
      stars: [],
      amenities: [],
      maxPrice: 3000
    });
  };

  return (
    <div className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0a0a0a]">
      
      {/* Background Decorative Atmosphere */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#C5A059]/10 via-[#141414]/20 to-transparent blur-3xl opacity-60"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#141414] blur-3xl rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center space-y-4">
        
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#C5A059]/50 text-[#C5A059] text-[0.65rem] font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Curated 5-Star Sanctuaries & Boutique Suites</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Find your <span className="gold-gradient-text not-italic font-bold">sanctuary</span>.
        </h1>

        <p className="text-[#888888] text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
          Reserve verified luxury suites, private overwater villas, and alpine chalets. Powered by a high-availability Google Apps Script and Google Sheets database architecture.
        </p>

        {/* Main Search Floating Bar */}
        <div className="pt-6">
          <form 
            onSubmit={handleApplySearch}
            className="bg-[#141414]/95 backdrop-blur-2xl p-3 sm:p-4 rounded-xl border border-[#C5A059] shadow-2xl shadow-black max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 text-left"
          >
            
            {/* Destination Field */}
            <div className="md:col-span-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#262626] hover:border-[#C5A059]/60 transition-colors">
              <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-[#C5A059] flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-[#C5A059]" />
                <span>Destination</span>
              </label>
              <input
                id="search-destination-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="French Riviera, Paris, Kyoto..."
                className="w-full bg-transparent text-white placeholder-[#666666] text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Check-in / Check-out Dates */}
            <div className="md:col-span-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#262626] hover:border-[#C5A059]/60 transition-colors grid grid-cols-2 gap-2">
              <div>
                <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-[#888888] flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-[#888888]" />
                  <span>Check-In</span>
                </label>
                <input
                  id="search-checkin-input"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent text-white text-xs font-medium focus:outline-none"
                />
              </div>
              <div className="border-l border-[#262626] pl-2">
                <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-[#888888] flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-[#888888]" />
                  <span>Check-Out</span>
                </label>
                <input
                  id="search-checkout-input"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-transparent text-white text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Guests & Filters Trigger */}
            <div className="md:col-span-2 p-3 rounded-lg bg-[#0a0a0a] border border-[#262626] hover:border-[#C5A059]/60 transition-colors">
              <label className="text-[0.65rem] uppercase tracking-widest font-semibold text-[#888888] flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-[#888888]" />
                <span>Guests</span>
              </label>
              <select
                id="search-guests-select"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-[#141414] text-white">1 Guest (Solo)</option>
                <option value={2} className="bg-[#141414] text-white">2 Guests (1 Suite)</option>
                <option value={3} className="bg-[#141414] text-white">3 Guests</option>
                <option value={4} className="bg-[#141414] text-white">4 Guests (Family)</option>
                <option value={6} className="bg-[#141414] text-white">6+ Guests (Villa)</option>
              </select>
            </div>

            {/* Search Action Button */}
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                id="hero-search-submit-btn"
                type="submit"
                className="w-full h-full min-h-[50px] rounded-lg bg-[#C5A059] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-black" />
                <span>Search</span>
              </button>
            </div>

          </form>

          {/* Quick Filter Bar & Popular destinations */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto px-2">
            
            {/* Quick Destination Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
              <span className="text-[#888888] text-[0.65rem] uppercase tracking-widest font-medium mr-1">Curated:</span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleQuickDestination(dest.name)}
                  className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                    destination.toLowerCase() === dest.name.toLowerCase()
                      ? 'bg-[#C5A059] text-black font-bold'
                      : 'bg-[#141414] text-[#888888] hover:bg-[#1a1a1a] hover:text-[#e0e0e0] border border-[#262626]'
                  }`}
                >
                  {dest.name}
                </button>
              ))}
            </div>

            {/* Filter Toggle Button */}
            <button
              id="filter-drawer-toggle-btn"
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-medium border flex items-center gap-1.5 transition-all ${
                selectedAmenities.length > 0 || selectedStars.length > 0 || maxPrice < 3000
                  ? 'bg-[#141414] text-[#C5A059] border-[#C5A059]'
                  : 'bg-[#141414] text-[#888888] border-[#262626] hover:text-[#e0e0e0]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Filters {(selectedAmenities.length + (selectedStars.length ? 1 : 0) + (maxPrice < 3000 ? 1 : 0)) > 0 ? `(${selectedAmenities.length + (selectedStars.length ? 1 : 0)})` : ''}</span>
            </button>

          </div>

          {/* Expanded Filter Drawer */}
          {showFilterDrawer && (
            <div className="mt-4 p-5 rounded-lg bg-[#141414] border border-[#262626] shadow-2xl max-w-5xl mx-auto text-left space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="font-semibold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
                  <span>Refine Luxury Stays</span>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-[#C5A059] hover:underline uppercase tracking-wider"
                >
                  Reset all filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Max Price Per Night */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#e0e0e0] mb-2">
                    <span>Max Nightly Rate</span>
                    <span className="text-[#C5A059] font-bold">${maxPrice.toLocaleString()} / night</span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={3000}
                    step={50}
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxPrice(val);
                      onSearch({ maxPrice: val });
                    }}
                    className="w-full accent-[#C5A059] bg-[#262626] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#888888] mt-1">
                    <span>$400</span>
                    <span>$1,500</span>
                    <span>$3,000+</span>
                  </div>
                </div>

                {/* Amenities checklist */}
                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-2">
                    Signature Amenities & Experiences
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AMENITY_TAGS.map((tag) => {
                      const isSelected = selectedAmenities.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleAmenity(tag)}
                          className={`px-2.5 py-1 rounded-sm text-xs transition-all ${
                            isSelected
                              ? 'bg-[#141414] text-[#C5A059] border border-[#C5A059] font-medium'
                              : 'bg-[#0a0a0a] text-[#888888] border border-[#262626] hover:text-[#e0e0e0]'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
