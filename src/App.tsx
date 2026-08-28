import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hotel, 
  Room, 
  Booking, 
  User, 
  SearchFilters, 
  UserRole 
} from './types';
import { api } from './services/apiBridge';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { HotelCard } from './components/HotelCard';
import { HotelDetailsModal } from './components/HotelDetailsModal';
import { BookingCheckoutModal } from './components/BookingCheckoutModal';
import { VoucherModal } from './components/VoucherModal';
import { UserBookingsModal } from './components/UserBookingsModal';
import { HotelAdminDashboard } from './components/HotelAdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AuthModal } from './components/AuthModal';
import { DeploymentModal } from './components/DeploymentModal';
import { 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Calendar, 
  FileSpreadsheet, 
  HelpCircle,
  Phone,
  Mail,
  RotateCcw,
  Check
} from 'lucide-react';

export default function App() {
  // Global Application State
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  // Search & Filter State
  const [filters, setFilters] = useState<SearchFilters>({
    destination: '',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-19',
    guests: 2,
    roomType: 'all',
    minPrice: 0,
    maxPrice: 5000,
    amenities: []
  });

  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [selectedAmenityFilter, setSelectedAmenityFilter] = useState<string>('all');

  // Modal Control States
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<Hotel | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<{
    hotel: Hotel;
    room: Room;
    dates: { checkIn: string; checkOut: string; guests: number };
  } | null>(null);

  const [activeVoucher, setActiveVoucher] = useState<Booking | null>(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showHotelAdmin, setShowHotelAdmin] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  // Initial Load & Hotel Search
  const fetchHotels = async (activeFilters = filters) => {
    setLoadingHotels(true);
    try {
      const data = await api.searchHotels(activeFilters);
      setHotels(data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchHotels(filters);
  }, [filters.destination, filters.guests, filters.roomType]);

  const handleSearchSubmit = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    fetchHotels(newFilters);
    // Smooth scroll down to hotel collection
    const target = document.getElementById('luxury-collection-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickBook = async (hotel: Hotel) => {
    try {
      const details = await api.getHotelDetails(hotel.id);
      const defaultRoom = details.rooms[0] || {
        id: 'RM-DEFAULT',
        hotelId: hotel.id,
        name: 'Deluxe Heritage Suite',
        type: 'suite',
        description: 'Luxury accommodation with bespoke amenities.',
        pricePerNight: hotel.priceFrom,
        capacityGuests: filters.guests || 2,
        bedType: 'King Bed',
        sizeSqFt: 850,
        images: hotel.images,
        amenities: hotel.amenities,
        totalInventory: 2,
        status: 'available'
      };

      setSelectedRoomForBooking({
        hotel,
        room: defaultRoom,
        dates: {
          checkIn: filters.checkInDate || '2026-09-15',
          checkOut: filters.checkOutDate || '2026-09-19',
          guests: filters.guests || 2
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    const updated = api.switchDemoRole(role);
    setCurrentUser(updated);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  // Filter and sort computation
  const filteredAndSortedHotels = useMemo(() => {
    let list = [...hotels];

    if (selectedAmenityFilter !== 'all') {
      list = list.filter(h => h.amenities.some(a => a.toLowerCase().includes(selectedAmenityFilter.toLowerCase())));
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.priceFrom - a.priceFrom);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // featured
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [hotels, selectedAmenityFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col selection:bg-[#C5A059] selection:text-black">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeRole={currentUser?.role || 'customer'}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenBookings={() => setShowMyBookings(true)}
        onOpenMyBookings={() => setShowMyBookings(true)}
        onOpenHotelAdmin={() => setShowHotelAdmin(true)}
        onOpenSuperAdmin={() => setShowSuperAdmin(true)}
        onOpenGasHub={() => setShowDeploymentModal(true)}
        onOpenDeploymentGuide={() => setShowDeploymentModal(true)}
        onSwitchRole={handleRoleChange}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* 2. Hero Luxury Search & Destination Showcase */}
      <HeroSearch
        filters={filters}
        initialFilters={filters}
        onSearch={handleSearchSubmit}
        totalHotelsCount={hotels.length}
      />

      {/* 3. Luxury Sanctuary Catalog Section */}
      <main id="luxury-collection-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        
        {/* Section Header & Interactive Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#262626] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest text-[#C5A059]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>World-Class Sanctuaries</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">
              Curated Luxury Stays
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] font-light mt-1">
              Showing {filteredAndSortedHotels.length} luxury 5-star properties synchronized with Google Sheets.
            </p>
          </div>

          {/* Filtering and Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            
            {/* Signature Feature Filter */}
            <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#262626]">
              <span className="text-[11px] text-[#888888] font-semibold px-2">Amenity:</span>
              <button
                onClick={() => setSelectedAmenityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedAmenityFilter === 'all' ? 'bg-[#C5A059] text-black font-bold' : 'text-[#e0e0e0] hover:text-white hover:bg-[#262626]/60'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedAmenityFilter('Michelin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedAmenityFilter === 'Michelin' ? 'bg-[#C5A059] text-black font-bold' : 'text-[#e0e0e0] hover:text-white hover:bg-[#262626]/60'
                }`}
              >
                Michelin Dining
              </button>
              <button
                onClick={() => setSelectedAmenityFilter('Spa')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedAmenityFilter === 'Spa' ? 'bg-[#C5A059] text-black font-bold' : 'text-[#e0e0e0] hover:text-white hover:bg-[#262626]/60'
                }`}
              >
                Guerlain Spa
              </button>
              <button
                onClick={() => setSelectedAmenityFilter('Pool')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedAmenityFilter === 'Pool' ? 'bg-[#C5A059] text-black font-bold' : 'text-[#e0e0e0] hover:text-white hover:bg-[#262626]/60'
                }`}
              >
                Private Pool
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#141414] px-3 py-2 rounded-xl border border-[#262626]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#141414]">Featured First</option>
                <option value="price_asc" className="bg-[#141414]">Price: Low to High</option>
                <option value="price_desc" className="bg-[#141414]">Price: High to Low</option>
                <option value="rating" className="bg-[#141414]">Guest Rating ★</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedAmenityFilter !== 'all' || filters.destination) && (
              <button
                onClick={() => {
                  setSelectedAmenityFilter('all');
                  setFilters({ ...filters, destination: '', roomType: 'all' });
                }}
                className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#262626] text-[#e0e0e0] border border-[#262626] text-xs flex items-center gap-1"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Reset</span>
              </button>
            )}

          </div>
        </div>

        {/* Hotel Grid */}
        {loadingHotels ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-[#141414] border border-[#262626] animate-pulse"></div>
            ))}
          </div>
        ) : filteredAndSortedHotels.length === 0 ? (
          <div className="py-20 text-center bg-[#141414] rounded-3xl border border-[#262626] p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] text-[#C5A059] border border-[#262626] flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-xl font-bold text-white">No Properties Found</h3>
              <p className="text-xs text-[#888888] mt-1 max-w-md mx-auto">
                No hotels match your current search criteria. Try clearing the destination filter or selecting "All Stays".
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedAmenityFilter('all');
                setFilters({ ...filters, destination: '', roomType: 'all' });
                fetchHotels({ ...filters, destination: '', roomType: 'all' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C5A059] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]"
            >
              Show All Available Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAndSortedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelect={(h) => setSelectedHotelForDetails(h)}
                onQuickBook={(h) => handleQuickBook(h)}
              />
            ))}
          </div>
        )}

      </main>

      {/* 4. Luxury Experience & Trust Banner */}
      <section className="bg-[#141414] border-t border-[#262626] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#262626] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-white text-sm">Direct Google Sheets DB</h4>
              <p className="text-xs text-[#888888] mt-0.5">Automated two-way synchronization with Google Sheets backend database.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#262626] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-white text-sm">256-Bit Secure Hashing</h4>
              <p className="text-xs text-[#888888] mt-0.5">Enterprise security with Apps Script digest tokens and role access control.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#262626] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-white text-sm">24/7 VIP Concierge</h4>
              <p className="text-xs text-[#888888] mt-0.5">Dedicated butler services, helicopter transfers, and personalized pillow menus.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#262626] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-luxury font-bold text-white text-sm">Flexible Guarantee</h4>
              <p className="text-xs text-[#888888] mt-0.5">Complimentary cancellation up to 48 hours prior to check-in.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Luxury Brand Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#262626] py-12 text-xs text-[#888888]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-[#262626] pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059] flex items-center justify-center text-black font-bold font-serif-luxury">
                AI
              </div>
              <div>
                <div className="font-serif-luxury text-base font-bold text-white tracking-widest uppercase">
                  AI HOTELS & ROOMS
                </div>
                <div className="text-[10px] text-[#C5A059] tracking-widest uppercase">
                  Google Apps Script & Sheets Web App
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setShowDeploymentModal(true)}
                className="text-[#e0e0e0] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#C5A059]" />
                <span>Google Apps Script Setup Guide</span>
              </button>
              <span className="text-[#333333]">•</span>
              <button
                onClick={() => setShowMyBookings(true)}
                className="text-[#e0e0e0] hover:text-[#C5A059] transition-colors"
              >
                My Reservations
              </button>
              <span className="text-[#333333]">•</span>
              <button
                onClick={() => setShowHotelAdmin(true)}
                className="text-[#e0e0e0] hover:text-[#C5A059] transition-colors"
              >
                Hotel GM Portal
              </button>
              <span className="text-[#333333]">•</span>
              <button
                onClick={() => setShowSuperAdmin(true)}
                className="text-[#e0e0e0] hover:text-[#C5A059] transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#666666]">
            <p>© 2026 AI HOTELS & ROOMS INTERACTIVE. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Backend: GS-Cloud Connected</span>
              <span className="text-[#333333]">•</span>
              <span>Database: Google Sheets (Users, Hotels, Rooms, Bookings, Payments, Reviews)</span>
            </p>
          </div>

        </div>
      </footer>

      {/* --- APPLICATION MODALS & DIALOGS --- */}

      {/* Hotel Details & Suites Modal */}
      {selectedHotelForDetails && (
        <HotelDetailsModal
          hotel={selectedHotelForDetails}
          searchFilters={filters}
          onClose={() => setSelectedHotelForDetails(null)}
          onSelectRoomForBooking={(hotel, room, dates) => {
            setSelectedHotelForDetails(null);
            setSelectedRoomForBooking({ hotel, room, dates });
          }}
        />
      )}

      {/* Booking Checkout & Payment Modal */}
      {selectedRoomForBooking && (
        <BookingCheckoutModal
          hotel={selectedRoomForBooking.hotel}
          room={selectedRoomForBooking.room}
          reservationDates={selectedRoomForBooking.dates}
          currentUser={currentUser}
          onClose={() => setSelectedRoomForBooking(null)}
          onBookingSuccess={(booking) => {
            // keep modal in confirmed state or allow voucher launch
          }}
        />
      )}

      {/* Official Voucher / Printable Modal */}
      {activeVoucher && (
        <VoucherModal
          booking={activeVoucher}
          onClose={() => setActiveVoucher(null)}
        />
      )}

      {/* My Bookings History Modal */}
      {showMyBookings && (
        <UserBookingsModal
          onClose={() => setShowMyBookings(false)}
          onViewVoucher={(b) => {
            setShowMyBookings(false);
            setActiveVoucher(b);
          }}
          onExploreHotels={() => {
            const target = document.getElementById('luxury-collection-section');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Hotel Admin (GM) Dashboard Modal */}
      {showHotelAdmin && (
        <HotelAdminDashboard
          currentUser={currentUser}
          onClose={() => setShowHotelAdmin(false)}
          onSelectBookingVoucher={(b) => {
            setShowHotelAdmin(false);
            setActiveVoucher(b);
          }}
        />
      )}

      {/* Super Admin Dashboard Modal */}
      {showSuperAdmin && (
        <SuperAdminDashboard
          onClose={() => setShowSuperAdmin(false)}
          onSelectBookingVoucher={(b) => {
            setShowSuperAdmin(false);
            setActiveVoucher(b);
          }}
        />
      )}

      {/* Authentication (Login/Register/Reset) Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {/* Google Apps Script & Sheets Deployment Guide Modal */}
      {showDeploymentModal && (
        <DeploymentModal
          onClose={() => setShowDeploymentModal(false)}
        />
      )}

    </div>
  );
}
