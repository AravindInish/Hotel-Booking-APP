import React, { useState, useEffect } from 'react';
import { Hotel, Room, Review, SearchFilters } from '../types';
import { api } from '../services/apiBridge';
import { 
  X, 
  Star, 
  MapPin, 
  Sparkles, 
  Users, 
  Bed, 
  Maximize2, 
  Check, 
  Calendar, 
  Mail, 
  Phone, 
  ShieldCheck, 
  MessageSquarePlus, 
  ChevronRight,
  Clock,
  Loader2,
  Coffee,
  Wifi,
  Car,
  Compass
} from 'lucide-react';

interface HotelDetailsModalProps {
  hotel: Hotel;
  searchFilters: SearchFilters;
  onClose: () => void;
  onSelectRoomForBooking: (hotel: Hotel, room: Room, dates: { checkIn: string; checkOut: string; guests: number }) => void;
}

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({
  hotel,
  searchFilters,
  onClose,
  onSelectRoomForBooking
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'overview' | 'reviews'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Date selection state inside modal
  const [checkInDate, setCheckInDate] = useState(searchFilters.checkInDate || '2026-09-15');
  const [checkOutDate, setCheckOutDate] = useState(searchFilters.checkOutDate || '2026-09-19');
  const [guests, setGuests] = useState(searchFilters.guests || 2);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Availability cache per room
  const [checkingAvail, setCheckingAvail] = useState<Record<string, boolean>>({});
  const [availResults, setAvailResults] = useState<Record<string, { available: boolean; slots: number }>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const details = await api.getHotelDetails(hotel.id);
        if (isMounted) {
          setRooms(details.rooms);
          setReviews(details.reviews);
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [hotel.id]);

  // Check room availability whenever dates change
  useEffect(() => {
    rooms.forEach(async (room) => {
      setCheckingAvail(prev => ({ ...prev, [room.id]: true }));
      try {
        const res = await api.checkAvailability(hotel.id, room.id, checkInDate, checkOutDate);
        setAvailResults(prev => ({
          ...prev,
          [room.id]: { available: res.available, slots: res.availableSlots }
        }));
      } catch (e) {
        setAvailResults(prev => ({
          ...prev,
          [room.id]: { available: true, slots: room.totalInventory }
        }));
      } finally {
        setCheckingAvail(prev => ({ ...prev, [room.id]: false }));
      }
    });
  }, [rooms, checkInDate, checkOutDate, hotel.id]);

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80'
  ];

  const calculateNights = () => {
    const dIn = new Date(checkInDate);
    const dOut = new Date(checkOutDate);
    if (isNaN(dIn.getTime()) || isNaN(dOut.getTime()) || dOut <= dIn) return 1;
    return Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await api.submitReview({
        hotelId: hotel.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      setReviewSuccessMsg('Your verified review was submitted to Google Sheets database!');
      setShowReviewForm(false);
      setReviewComment('');
      setReviewTitle('');
      // Reload reviews
      const updated = await api.getHotelDetails(hotel.id);
      setReviews(updated.reviews);
    } catch (err: any) {
      alert(err.message || 'Error submitting review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Close Button */}
        <button
          id="close-hotel-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-sm bg-black/80 backdrop-blur-md text-[#e0e0e0] hover:text-white hover:bg-black transition-all border border-[#262626]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Hero Gallery Banner */}
        <div className="relative bg-[#0a0a0a]">
          <div className="aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden relative">
            <img
              src={images[selectedPhotoIndex] || images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
            
            {/* Header Overlay Info */}
            <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#C5A059] text-xs font-semibold uppercase tracking-widest mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hotel.city}, {hotel.country}</span>
                  <span className="text-[#666666]">•</span>
                  <span className="text-[#888888]">{hotel.address}</span>
                </div>
                <h1 className="font-serif-luxury text-2xl sm:text-4xl font-normal italic text-white tracking-tight">
                  {hotel.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#888888] font-light mt-1 max-w-2xl line-clamp-1">
                  {hotel.tagline}
                </p>
              </div>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-black/80 backdrop-blur-md border border-[#262626] text-white">
                <div className="flex items-center gap-1 text-[#C5A059] font-bold text-sm">
                  <Star className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                  <span>{hotel.rating.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-[#888888] border-l border-[#262626] pl-2">
                  <span>{hotel.reviewCount} verified guest reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery Thumbnails Bar */}
          {images.length > 1 && (
            <div className="px-6 py-2 bg-[#0a0a0a] border-b border-[#262626] flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase tracking-widest text-[#888888] font-semibold mr-1">Gallery:</span>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`h-12 w-20 rounded-sm overflow-hidden shrink-0 border transition-all ${
                    idx === selectedPhotoIndex ? 'border-[#C5A059] shadow-md' : 'border-[#262626] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 pt-4 border-b border-[#262626] bg-[#0a0a0a] text-xs uppercase tracking-widest font-medium">
          <button
            id="tab-rooms-btn"
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'rooms' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-[#e0e0e0]'
            }`}
          >
            <span>Suites & Rooms</span>
            <span className="px-2 py-0.5 rounded-sm text-[10px] bg-[#141414] text-[#C5A059] border border-[#262626]">
              {rooms.length}
            </span>
          </button>
          <button
            id="tab-overview-btn"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'overview' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-[#e0e0e0]'
            }`}
          >
            Property Story & Inclusions
          </button>
          <button
            id="tab-reviews-btn"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'reviews' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-[#e0e0e0]'
            }`}
          >
            <span>Guest Reviews</span>
            <span className="px-2 py-0.5 rounded-sm text-[10px] bg-[#141414] text-[#C5A059] border border-[#262626]">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0a0a0a]">

          {/* Quick Date & Guest Adjustment Bar */}
          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-[0.65rem] uppercase tracking-widest text-[#C5A059] font-semibold block mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-[#0a0a0a] px-3 py-2 rounded-sm text-white text-xs font-medium border border-[#262626] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label className="text-[0.65rem] uppercase tracking-widest text-[#888888] font-semibold block mb-1">
                Check-out Date ({nights} {nights === 1 ? 'Night' : 'Nights'})
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-[#0a0a0a] px-3 py-2 rounded-sm text-white text-xs font-medium border border-[#262626] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label className="text-[0.65rem] uppercase tracking-widest text-[#888888] font-semibold block mb-1">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] px-3 py-2 rounded-sm text-white text-xs font-medium border border-[#262626] focus:outline-none focus:border-[#C5A059]"
              >
                <option value={1} className="bg-[#141414]">1 Guest</option>
                <option value={2} className="bg-[#141414]">2 Guests</option>
                <option value={3} className="bg-[#141414]">3 Guests</option>
                <option value={4} className="bg-[#141414]">4 Guests</option>
                <option value={6} className="bg-[#141414]">6+ Guests (Villa Suite)</option>
              </select>
            </div>
          </div>

          {/* TAB 1: ROOMS & SUITES */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif-luxury text-xl font-bold text-white">Select Your Luxury Suite</h2>
                  <p className="text-xs text-[#888888]">All reservations include high-speed Wi-Fi, daily gourmet breakfast, and concierge access.</p>
                </div>
                <div className="text-xs text-[#C5A059] font-medium font-serif-luxury">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} Stay Calculated
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#888888]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
                  <span className="text-xs uppercase tracking-widest">Retrieving room inventory from Google Sheets...</span>
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-8 text-center bg-[#141414] rounded-sm border border-[#262626]">
                  <p className="text-[#888888] text-xs">No rooms available for the selected parameters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {rooms.map((room) => {
                    const isChecking = checkingAvail[room.id];
                    const availInfo = availResults[room.id] || { available: true, slots: room.totalInventory };
                    const totalPrice = room.pricePerNight * nights;

                    return (
                      <div
                        key={room.id}
                        id={`room-option-${room.id}`}
                        className="bg-[#141414] rounded-sm border border-[#262626] hover:border-[#C5A059] p-4 sm:p-5 transition-all flex flex-col md:flex-row gap-5"
                      >
                        {/* Room Image */}
                        <div className="md:w-64 aspect-[16/10] md:aspect-auto rounded-sm overflow-hidden bg-[#0a0a0a] shrink-0 border border-[#262626]">
                          <img
                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Room Details */}
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-[#0a0a0a] text-[#C5A059] border border-[#262626]">
                                  {room.type}
                                </span>
                                <h3 className="font-serif-luxury text-lg font-bold text-white">{room.name}</h3>
                              </div>
                              
                              {/* Live Availability Tag */}
                              {isChecking ? (
                                <span className="text-xs text-[#888888] flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin text-[#C5A059]" />
                                  <span>Verifying dates...</span>
                                </span>
                              ) : availInfo.available ? (
                                <span className="text-xs text-[#C5A059] flex items-center gap-1 font-medium bg-[#1a1a1a] px-2 py-0.5 rounded-sm border border-[#C5A059]/40">
                                  <Check className="w-3 h-3 text-[#C5A059]" />
                                  <span>{availInfo.slots} {availInfo.slots === 1 ? 'Suite Left' : 'Suites Available'}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-rose-400 font-medium bg-rose-950/40 px-2 py-0.5 rounded-sm border border-rose-800/40">
                                  Fully Booked for Dates
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#888888] font-light mt-1.5 leading-relaxed">
                              {room.description}
                            </p>

                            {/* Room Specs Badges */}
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#888888]">
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                                <span>Up to {room.capacityGuests} Guests</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-[#C5A059]" />
                                <span>{room.bedType}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Maximize2 className="w-3.5 h-3.5 text-[#C5A059]" />
                                <span>{room.sizeSqFt} sq ft</span>
                              </div>
                            </div>

                            {/* Room Amenities Pills */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {room.amenities.map((am, i) => (
                                <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#0a0a0a] text-[#888888] border border-[#262626]">
                                  {am}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Pricing & Reservation Action */}
                          <div className="pt-3 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="font-serif-luxury text-xl font-bold text-[#C5A059]">${room.pricePerNight.toLocaleString()}</span>
                                <span className="text-xs text-[#888888]">/ night</span>
                              </div>
                              <div className="text-[11px] text-[#666666]">
                                ${totalPrice.toLocaleString()} total for {nights} {nights === 1 ? 'night' : 'nights'} (excl. tax)
                              </div>
                            </div>

                            <button
                              id={`reserve-room-btn-${room.id}`}
                              disabled={!availInfo.available || isChecking}
                              onClick={() => onSelectRoomForBooking(hotel, room, { checkIn: checkInDate, checkOut: checkOutDate, guests })}
                              className={`px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${
                                availInfo.available && !isChecking
                                  ? 'bg-[#C5A059] text-black hover:bg-[#d4af37]'
                                  : 'bg-[#141414] text-[#666666] border border-[#262626] cursor-not-allowed'
                              }`}
                            >
                              <span>Reserve Suite</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERVIEW & AMENITIES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white mb-2">The Sanctuary Story</h2>
                <p className="text-xs sm:text-sm text-[#888888] font-light leading-relaxed whitespace-pre-line">
                  {hotel.description}
                </p>
              </div>

              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white mb-3">Signature Amenities & Inclusions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="p-3.5 rounded-sm bg-[#141414] border border-[#262626] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#0a0a0a] text-[#C5A059] border border-[#262626] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-[#e0e0e0]">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concierge & Location Contacts */}
              <div className="p-5 rounded-sm bg-[#141414] border border-[#262626] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-serif-luxury">Concierge & Guest Inquiries</h3>
                  <p className="text-xs text-[#888888]">Available 24/7 for transfers, private dining, or bespoke itineraries.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <a 
                    href={`mailto:${hotel.contactEmail}`}
                    className="px-3.5 py-2 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#e0e0e0] flex items-center gap-2 border border-[#262626]"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{hotel.contactEmail}</span>
                  </a>
                  <a 
                    href={`tel:${hotel.contactPhone}`}
                    className="px-3.5 py-2 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#e0e0e0] flex items-center gap-2 border border-[#262626]"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{hotel.contactPhone}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-luxury text-xl font-bold text-white">Verified Guest Ratings</h2>
                  <p className="text-xs text-[#888888]">Authentic reviews recorded directly in the Google Sheets database.</p>
                </div>
                <button
                  id="open-write-review-btn"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 rounded-sm bg-[#141414] text-[#C5A059] border border-[#C5A059] hover:bg-[#1a1a1a] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{showReviewForm ? 'Cancel Review' : 'Write Verified Review'}</span>
                </button>
              </div>

              {reviewSuccessMsg && (
                <div className="p-3.5 rounded-sm bg-[#141414] border border-[#C5A059] text-[#C5A059] text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              {/* Review Input Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="p-5 rounded-sm bg-[#141414] border border-[#262626] space-y-3 animate-in fade-in">
                  <h3 className="text-sm font-bold text-white font-serif-luxury">Share Your Stay Experience</h3>
                  
                  {/* Rating Selector */}
                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-[#444444] hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#444444]'}`} />
                        </button>
                      ))}
                      <span className="text-xs text-[#C5A059] font-semibold ml-2">{reviewRating} Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Review Headline</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Unrivaled hospitality and breathtaking views"
                      className="w-full bg-[#0a0a0a] px-3 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Your Comments & Memories</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe the service, dining, suite comfort, or unique touches..."
                      required
                      className="w-full bg-[#0a0a0a] px-3 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-sm bg-[#1a1a1a] text-[#888888] text-xs font-semibold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-4 py-2 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] transition-colors flex items-center gap-1.5"
                    >
                      {reviewSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Submit Review</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-sm bg-[#141414] border border-[#262626] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {rev.userAvatar ? (
                          <img src={rev.userAvatar} alt={rev.userName} className="w-8 h-8 rounded-full object-cover border border-[#C5A059]" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-[#C5A059] font-bold border border-[#C5A059] flex items-center justify-center text-xs">
                            {rev.userName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-white">{rev.userName}</div>
                          <div className="text-[10px] text-[#888888]">Stayed {rev.stayDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#333333]'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-[#e0e0e0]">{rev.title}</h4>
                    <p className="text-xs text-[#888888] font-light leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
