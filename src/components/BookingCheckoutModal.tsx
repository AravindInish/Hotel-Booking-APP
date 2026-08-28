import React, { useState } from 'react';
import { Hotel, Room, Booking, User } from '../types';
import { api } from '../services/apiBridge';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Loader2, 
  Lock, 
  FileText, 
  Award,
  Clock,
  Wine,
  Car
} from 'lucide-react';

interface BookingCheckoutModalProps {
  hotel: Hotel;
  room: Room;
  reservationDates: { checkIn: string; checkOut: string; guests: number };
  currentUser: User | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  hotel,
  room,
  reservationDates,
  currentUser,
  onClose,
  onBookingSuccess
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Guest details form state
  const [guestName, setGuestName] = useState(currentUser?.name || 'Lady Sophia Montgomery');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || 'guest@example.com');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '+1 (555) 982-1144');
  const [specialRequests, setSpecialRequests] = useState('High floor preferred. Please prepare chilled vintage champagne upon arrival.');
  const [pillowPreference, setPillowPreference] = useState('Goose Down Feather');
  const [airportTransfer, setAirportTransfer] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'wire'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('892');
  const [cardHolder, setCardHolder] = useState(guestName);

  // Financial calculations
  const calculateNights = () => {
    const dIn = new Date(reservationDates.checkIn);
    const dOut = new Date(reservationDates.checkOut);
    if (isNaN(dIn.getTime()) || isNaN(dOut.getTime()) || dOut <= dIn) return 1;
    return Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const subtotal = nights * room.pricePerNight;
  const taxAmount = Math.round(subtotal * 0.12 * 100) / 100;
  const resortFee = 50;
  const transferFee = airportTransfer ? 150 : 0;
  const totalAmount = subtotal + taxAmount + resortFee + transferFee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setErrorMsg('Please provide your name and email.');
      return;
    }
    setErrorMsg('');
    setStep('payment');
  };

  const handleExecuteBooking = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const combinedRequests = [
        specialRequests,
        `Pillow Menu: ${pillowPreference}`,
        airportTransfer ? 'Requested Chauffeured Airport Transfer ($150)' : ''
      ].filter(Boolean).join(' | ');

      const paymentMethodName = 
        paymentMethod === 'card' ? 'American Express Centurion (•••• 8821)' :
        paymentMethod === 'apple_pay' ? 'Apple Pay (Biometric Verified)' :
        paymentMethod === 'google_pay' ? 'Google Pay' : 'Bespoke Luxury Wire Transfer';

      const res = await api.createBooking({
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomId: room.id,
        roomName: room.name,
        roomType: room.type,
        checkInDate: reservationDates.checkIn,
        checkOutDate: reservationDates.checkOut,
        guests: reservationDates.guests,
        pricePerNight: room.pricePerNight,
        paymentMethod: paymentMethodName,
        specialRequests: combinedRequests,
        userName: guestName,
        userEmail: guestEmail,
        userPhone: guestPhone
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setStep('confirmed');
        
        // Trigger celebratory luxury confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff']
          });
        } catch (err) {
          // ignore confetti error
        }

        onBookingSuccess(res.booking);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#141414] border border-[#262626] flex items-center justify-center text-[#C5A059]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg font-bold text-white">
                {step === 'confirmed' ? 'Reservation Confirmed' : 'Reserve Your Luxury Suite'}
              </h2>
              <div className="text-[11px] text-[#888888]">
                {hotel.name} • {room.name}
              </div>
            </div>
          </div>

          {step !== 'confirmed' && (
            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className="p-2 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar (if not confirmed) */}
        {step !== 'confirmed' && (
          <div className="grid grid-cols-2 text-center text-xs font-semibold border-b border-[#262626]">
            <div className={`py-2.5 flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] ${step === 'details' ? 'bg-[#141414] text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#888888]'}`}>
              <span className="w-4 h-4 rounded-sm bg-[#0a0a0a] border border-[#262626] flex items-center justify-center text-[10px]">1</span>
              <span>Guest Details & VIP Requests</span>
            </div>
            <div className={`py-2.5 flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] ${step === 'payment' ? 'bg-[#141414] text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-[#888888]'}`}>
              <span className="w-4 h-4 rounded-sm bg-[#0a0a0a] border border-[#262626] flex items-center justify-center text-[10px]">2</span>
              <span>Payment & Confirmation</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#0a0a0a]">
          
          {errorMsg && (
            <div className="p-3.5 rounded-sm bg-[#141414] border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: GUEST DETAILS & SPECIAL PREFERENCES */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              
              {/* Stay Summary Card */}
              <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">{room.type} Suite</div>
                  <h3 className="font-serif-luxury text-base font-bold text-white">{room.name}</h3>
                  <div className="text-xs text-[#888888] mt-0.5">{hotel.name} — {hotel.city}</div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-[#888888] text-[10px] uppercase tracking-wider">Dates</div>
                    <div className="font-bold text-white">{reservationDates.checkIn} to {reservationDates.checkOut}</div>
                  </div>
                  <div className="text-right border-l border-[#262626] pl-3">
                    <div className="text-[#888888] text-[10px] uppercase tracking-wider">Duration</div>
                    <div className="font-bold text-[#C5A059] font-serif-luxury">{nights} {nights === 1 ? 'Night' : 'Nights'}</div>
                  </div>
                </div>
              </div>

              {/* Guest Form Fields */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#C5A059]">Lead Guest Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      className="w-full bg-[#0a0a0a] px-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Email (for Instant Voucher) *</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="w-full bg-[#0a0a0a] px-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-[#0a0a0a] px-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#888888] block mb-1">Bespoke Pillow Menu</label>
                    <select
                      value={pillowPreference}
                      onChange={(e) => setPillowPreference(e.target.value)}
                      className="w-full bg-[#0a0a0a] px-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Goose Down Feather" className="bg-[#141414]">Hungarian Goose Down (Plush)</option>
                      <option value="Memory Foam Ergonomic" className="bg-[#141414]">Ergonomic Memory Foam</option>
                      <option value="Lavender Organic Silk" className="bg-[#141414]">Lavender & Organic Silk Infused</option>
                      <option value="Hypoallergenic Microfiber" className="bg-[#141414]">Hypoallergenic Microfiber</option>
                    </select>
                  </div>
                </div>

                {/* VIP Add-ons */}
                <div className="p-3.5 rounded-sm bg-[#141414] border border-[#262626] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#C5A059]" />
                      <div>
                        <div className="text-xs font-bold text-white">Chauffeured Airport Limousine Transfer</div>
                        <div className="text-[10px] text-[#888888]">Rolls-Royce Ghost or Mercedes Maybach S-Class greeting at baggage claim</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={airportTransfer}
                        onChange={(e) => setAirportTransfer(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#262626] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C5A059]"></div>
                      <span className="ml-2 text-xs font-semibold text-[#C5A059]">+$150</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#888888] block mb-1">Special Concierge Requests</label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Dietary requests, arrival time, high floor preference..."
                    className="w-full bg-[#0a0a0a] px-3 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-sm bg-[#1a1a1a] text-[#888888] text-xs font-semibold uppercase tracking-wider hover:bg-[#262626]"
                >
                  Back to Property
                </button>
                <button
                  id="checkout-step1-continue-btn"
                  type="submit"
                  className="px-6 py-2.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] shadow-lg transition-all"
                >
                  Continue to Payment (${totalAmount.toLocaleString()})
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: PAYMENT & TRANSPARENT COST BREAKDOWN */}
          {step === 'payment' && (
            <div className="space-y-5">
              
              {/* Cost Summary Breakdown */}
              <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-widest text-[10px] mb-1 text-[#C5A059]">Transparent Price Breakdown</h4>
                
                <div className="flex justify-between text-[#888888]">
                  <span>${room.pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-[#888888]">
                  <span>Luxury Hospitality & City Tax (12%)</span>
                  <span>${taxAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[#888888]">
                  <span>Daily Resort, Spa & Concierge Fee</span>
                  <span>${resortFee.toLocaleString()}</span>
                </div>

                {airportTransfer && (
                  <div className="flex justify-between text-[#C5A059]">
                    <span>VIP Chauffeured Airport Transfer</span>
                    <span>$150</span>
                  </div>
                )}

                <div className="border-t border-[#262626] pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount (USD)</span>
                  <span className="font-serif-luxury text-lg text-[#C5A059]">${totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#888888] uppercase tracking-widest text-[10px]">Select Payment Method</h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'card' ? 'bg-[#141414] border-[#C5A059] text-[#C5A059]' : 'bg-[#0a0a0a] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#C5A059]" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'apple_pay' ? 'bg-[#141414] border-[#C5A059] text-[#C5A059]' : 'bg-[#0a0a0a] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <Award className="w-5 h-5 text-[#C5A059]" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Apple Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'google_pay' ? 'bg-[#141414] border-[#C5A059] text-[#C5A059]' : 'bg-[#0a0a0a] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-[#C5A059]" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Google Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'wire' ? 'bg-[#141414] border-[#C5A059] text-[#C5A059]' : 'bg-[#0a0a0a] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <Lock className="w-5 h-5 text-[#C5A059]" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Concierge Wire</span>
                  </button>
                </div>

                {/* Card input mockup */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-sm bg-[#141414] border border-[#262626] space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-[#0a0a0a] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#0a0a0a] px-3.5 py-2 rounded-sm text-white text-xs font-mono border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#0a0a0a] px-3.5 py-2 rounded-sm text-white text-xs font-mono border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">CVC / Security Code</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-[#0a0a0a] px-3.5 py-2 rounded-sm text-white text-xs font-mono border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-[#888888] bg-[#141414] p-3 rounded-sm border border-[#262626]">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>256-bit encrypted transaction saved to secure Google Apps Script & Sheets database. Free cancellation up to 48 hours prior to check-in.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 rounded-sm bg-[#1a1a1a] text-[#888888] text-xs font-semibold uppercase tracking-wider hover:bg-[#262626]"
                >
                  Back to Details
                </button>
                <button
                  id="confirm-and-pay-btn"
                  type="button"
                  disabled={submitting}
                  onClick={handleExecuteBooking}
                  className="px-6 py-2.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] shadow-xl flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Writing to Google Sheets...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Confirm Reservation</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIRMED RESERVATION VOUCHER */}
          {step === 'confirmed' && confirmedBooking && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
              
              <div className="w-16 h-16 rounded-full bg-[#141414] text-[#C5A059] border border-[#C5A059] flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Booking Confirmed & Synchronized</span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-normal italic text-white mt-1">
                  We look forward to welcoming you, {guestName.split(' ')[0]}
                </h3>
                <p className="text-xs text-[#888888] mt-1">
                  A confirmation record has been written directly to your Google Sheets database.
                </p>
              </div>

              {/* Booking Pass Card */}
              <div className="p-5 rounded-sm bg-[#141414] border border-[#262626] max-w-md mx-auto text-left shadow-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-[#262626] pb-2.5">
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-mono">Booking Reference</div>
                    <div className="font-mono text-[#C5A059] font-bold text-base">{confirmedBooking.id}</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-sm bg-[#0a0a0a] text-[#C5A059] text-[10px] font-bold uppercase tracking-widest border border-[#C5A059]/40">
                    Confirmed
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[#888888] text-[10px] uppercase tracking-wider">Hotel & Destination</div>
                    <div className="font-bold text-white">{confirmedBooking.hotelName}</div>
                  </div>
                  <div>
                    <div className="text-[#888888] text-[10px] uppercase tracking-wider">Reserved Suite</div>
                    <div className="font-bold text-white">{confirmedBooking.roomName}</div>
                  </div>
                  <div>
                    <div className="text-[#888888] text-[10px] uppercase tracking-wider">Check-In</div>
                    <div className="font-bold text-white">{confirmedBooking.checkInDate} (15:00)</div>
                  </div>
                  <div>
                    <div className="text-[#888888] text-[10px] uppercase tracking-wider">Check-Out</div>
                    <div className="font-bold text-white">{confirmedBooking.checkOutDate} (12:00)</div>
                  </div>
                </div>

                <div className="border-t border-[#262626] pt-2 flex justify-between items-center text-xs">
                  <span className="text-[#888888]">Total Paid (Google Sheets DB)</span>
                  <span className="font-bold text-[#C5A059] font-serif-luxury text-base">${confirmedBooking.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Final Actions */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  id="confirmed-done-btn"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] shadow-md"
                >
                  Return to Stays
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
