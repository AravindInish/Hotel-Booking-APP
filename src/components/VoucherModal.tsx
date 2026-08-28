import React from 'react';
import { Booking } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  QrCode, 
  Phone, 
  Mail,
  CheckCircle2
} from 'lucide-react';

interface VoucherModalProps {
  booking: Booking;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  booking,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    const title = encodeURIComponent(`Luxury Stay: ${booking.hotelName}`);
    const details = encodeURIComponent(`Booking Ref: ${booking.id}\nSuite: ${booking.roomName}\nSpecial Requests: ${booking.specialRequests || 'None'}`);
    const location = encodeURIComponent(booking.hotelName);
    const startDate = booking.checkInDate.replace(/-/g, '') + 'T150000Z';
    const endDate = booking.checkOutDate.replace(/-/g, '') + 'T120000Z';
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Action Bar */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">Official Stay Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCalendar}
              className="px-3 py-1.5 rounded-sm bg-[#141414] hover:bg-[#1a1a1a] text-[#888888] hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-[#262626] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Add to Calendar</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-sm bg-[#C5A059] hover:bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div id="printable-voucher" className="p-6 sm:p-8 overflow-y-auto bg-[#0a0a0a] text-white space-y-6">
          
          {/* Top Brand & Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-5">
            <div>
              <div className="flex items-center gap-1.5 text-[#C5A059]">
                <span className="font-serif-luxury text-xl font-normal italic tracking-wider">AI HOTELS</span>
                <span className="font-light text-xl text-[#888888]">&</span>
                <span className="font-serif-luxury text-xl font-normal italic tracking-widest text-white">ROOMS</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#888888] font-mono mt-0.5">
                Bespoke Hospitality Concierge Voucher
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#141414] text-[#C5A059] text-xs font-bold border border-[#C5A059]/40 uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed & Paid</span>
              </div>
              <div className="font-mono text-xs text-[#C5A059] mt-1 font-bold">
                REF: {booking.id}
              </div>
            </div>
          </div>

          {/* Hotel & Guest Hero Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#141414] p-5 rounded-sm border border-[#262626]">
            
            <div>
              <div className="text-[10px] text-[#C5A059] uppercase font-semibold tracking-widest">Property & Location</div>
              <h3 className="font-serif-luxury text-xl font-bold text-white mt-1">{booking.hotelName}</h3>
              <div className="flex items-center gap-1 text-xs text-[#888888] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>Prime Sanctuary Destination</span>
              </div>
              <div className="text-xs text-[#888888] mt-2">
                Reserved Suite: <strong className="text-white">{booking.roomName}</strong> ({booking.roomType.toUpperCase()})
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-[#262626] pt-4 sm:pt-0 sm:pl-6">
              <div className="text-[10px] text-[#C5A059] uppercase font-semibold tracking-widest">Lead Guest</div>
              <h4 className="font-bold text-white text-base mt-1">{booking.userName}</h4>
              <div className="text-xs text-[#888888] mt-1">{booking.userEmail}</div>
              <div className="text-xs text-[#888888]">{booking.userPhone}</div>
              <div className="text-xs text-[#888888] mt-2">
                Party Size: <strong className="text-white">{booking.guests} Guests</strong>
              </div>
            </div>

          </div>

          {/* Dates & Timings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-sm bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-[#888888] uppercase tracking-wider">Check-In</div>
              <div className="text-xs font-bold text-white mt-1">{booking.checkInDate}</div>
              <div className="text-[10px] text-[#C5A059]">From 15:00</div>
            </div>
            <div className="p-3 rounded-sm bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-[#888888] uppercase tracking-wider">Check-Out</div>
              <div className="text-xs font-bold text-white mt-1">{booking.checkOutDate}</div>
              <div className="text-[10px] text-[#C5A059]">Until 12:00</div>
            </div>
            <div className="p-3 rounded-sm bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-[#888888] uppercase tracking-wider">Duration</div>
              <div className="text-xs font-bold text-white mt-1">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</div>
              <div className="text-[10px] text-[#C5A059]">Full Stay</div>
            </div>
            <div className="p-3 rounded-sm bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-[#888888] uppercase tracking-wider">Total Amount</div>
              <div className="text-xs font-bold text-[#C5A059] font-serif-luxury mt-1">${booking.totalAmount.toLocaleString()}</div>
              <div className="text-[10px] text-[#C5A059]">Fully Settled</div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] text-xs">
              <div className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mb-1">
                Concierge Notes & VIP Preferences
              </div>
              <p className="text-[#888888] font-light italic">
                "{booking.specialRequests}"
              </p>
            </div>
          )}

          {/* Barcode & Verification Footer */}
          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] text-[#C5A059] font-semibold">
                SECURITY HASH: SHA256-GAS-{booking.id}
              </div>
              <div className="text-[10px] text-[#888888] mt-0.5">
                Present this digital voucher or physical printout upon check-in at the concierge desk.
              </div>
            </div>

            {/* Barcode Mock Graphic */}
            <div className="flex items-center gap-1 font-mono tracking-widest text-[9px] bg-[#C5A059] text-black px-3 py-1.5 rounded-sm font-bold">
              <span>||||| | |||| ||| |||||| | ||| {booking.id}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
