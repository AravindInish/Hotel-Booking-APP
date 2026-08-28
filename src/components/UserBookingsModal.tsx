import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { api } from '../services/apiBridge';
import { 
  X, 
  CalendarCheck2, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Check, 
  Loader2, 
  Printer, 
  RotateCcw,
  Sparkles,
  Search
} from 'lucide-react';

interface UserBookingsModalProps {
  onClose: () => void;
  onViewVoucher: (booking: Booking) => void;
  onExploreHotels: () => void;
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  onClose,
  onViewVoucher,
  onExploreHotels
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getUserBookings();
      setBookings(data);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelReservation = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this luxury stay reservation? A full refund will be processed.')) {
      return;
    }
    setCancellingId(bookingId);
    setActionErrorMsg('');
    try {
      const res = await api.cancelBooking(bookingId, cancelReason);
      if (res.success) {
        setActionSuccessMsg(res.message);
        await loadBookings();
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'confirmed') return b.bookingStatus === 'confirmed';
    if (activeFilter === 'cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#141414] border border-[#262626] flex items-center justify-center text-[#C5A059]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                My Luxury Reservations & Stays
              </h2>
              <div className="text-[11px] text-[#888888]">
                Synchronized with Google Sheets Database • Real-Time Inventory
              </div>
            </div>
          </div>

          <button
            id="close-my-bookings-btn"
            onClick={onClose}
            className="p-2 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 bg-[#0a0a0a] border-b border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider text-[10px] transition-colors border ${activeFilter === 'all' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-[#141414] text-[#888888] border-[#262626] hover:text-white'}`}
            >
              All Stays ({bookings.length})
            </button>
            <button
              onClick={() => setActiveFilter('confirmed')}
              className={`px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider text-[10px] transition-colors border ${activeFilter === 'confirmed' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-[#141414] text-[#888888] border-[#262626] hover:text-white'}`}
            >
              Confirmed ({bookings.filter(b => b.bookingStatus === 'confirmed').length})
            </button>
            <button
              onClick={() => setActiveFilter('cancelled')}
              className={`px-3 py-1.5 rounded-sm font-semibold uppercase tracking-wider text-[10px] transition-colors border ${activeFilter === 'cancelled' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-[#141414] text-[#888888] border-[#262626] hover:text-white'}`}
            >
              Cancelled / Refunded ({bookings.filter(b => b.bookingStatus === 'cancelled').length})
            </button>
          </div>

          <button
            onClick={loadBookings}
            className="text-[#888888] hover:text-[#C5A059] flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh from Sheets</span>
          </button>
        </div>

        {/* Notifications */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-sm bg-[#141414] border border-[#C5A059] text-[#C5A059] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#C5A059]" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg('')} className="text-[#C5A059] hover:text-white">✕</button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-sm bg-[#141414] border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{actionErrorMsg}</span>
            </div>
            <button onClick={() => setActionErrorMsg('')} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#0a0a0a]">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#888888]">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
              <span className="text-xs uppercase tracking-widest">Fetching your reservations from Google Sheets...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-[#141414] rounded-sm border border-[#262626] p-8">
              <div className="w-12 h-12 rounded-sm bg-[#0a0a0a] border border-[#262626] text-[#C5A059] flex items-center justify-center mx-auto">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-white">No Reservations Found</h3>
                <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
                  You don't have any bookings matching this filter. Explore our curated properties and reserve your next luxury stay.
                </p>
              </div>
              <button
                onClick={() => { onClose(); onExploreHotels(); }}
                className="px-5 py-2.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] shadow-md inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Luxury Stays</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  id={`booking-card-${b.id}`}
                  className="p-5 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#C5A059] transition-all flex flex-col md:flex-row justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C5A059] bg-[#0a0a0a] px-2 py-0.5 rounded-sm border border-[#262626]">
                        {b.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${
                        b.bookingStatus === 'confirmed'
                          ? 'bg-[#0a0a0a] text-[#C5A059] border-[#C5A059]/40'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800'
                      }`}>
                        {b.bookingStatus === 'confirmed' ? 'Confirmed Stay' : 'Cancelled & Refunded'}
                      </span>
                    </div>

                    <h3 className="font-serif-luxury text-lg font-bold text-white">{b.hotelName}</h3>
                    <div className="text-xs text-[#C5A059] font-medium">{b.roomName} ({b.roomType.toUpperCase()})</div>

                    {/* Stay dates and guests */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-[#888888]">
                      <div>
                        <span className="text-[#666666] text-[10px] uppercase tracking-wider block">Dates</span>
                        <span className="font-semibold text-white">{b.checkInDate} → {b.checkOutDate}</span>
                      </div>
                      <div>
                        <span className="text-[#666666] text-[10px] uppercase tracking-wider block">Duration</span>
                        <span className="font-semibold text-white">{b.nights} {b.nights === 1 ? 'Night' : 'Nights'} ({b.guests} Guests)</span>
                      </div>
                      <div>
                        <span className="text-[#666666] text-[10px] uppercase tracking-wider block">Total Amount</span>
                        <span className="font-bold text-[#C5A059] font-serif-luxury text-sm">${b.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {b.specialRequests && (
                      <div className="text-[11px] text-[#888888] bg-[#0a0a0a] p-2.5 rounded-sm border border-[#262626] italic">
                        VIP Requests: "{b.specialRequests}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-end items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#262626]">
                    <button
                      id={`view-voucher-btn-${b.id}`}
                      onClick={() => onViewVoucher(b)}
                      className="px-4 py-2 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-[#262626] transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>View Voucher</span>
                    </button>

                    {b.bookingStatus === 'confirmed' && (
                      <button
                        id={`cancel-booking-btn-${b.id}`}
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancelReservation(b.id)}
                        className="px-4 py-2 rounded-sm bg-[#1a1a1a] hover:bg-rose-950/60 text-rose-300 text-xs font-medium uppercase tracking-wider border border-rose-900/60 transition-colors flex items-center gap-1"
                      >
                        {cancellingId === b.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <span>Cancel & Refund</span>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
