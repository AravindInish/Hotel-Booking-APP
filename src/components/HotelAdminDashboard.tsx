import React, { useState, useEffect } from 'react';
import { Hotel, Room, Booking, User } from '../types';
import { api } from '../services/apiBridge';
import { 
  Building2, 
  Bed, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Users, 
  Check, 
  X, 
  Loader2, 
  TrendingUp, 
  RotateCcw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface HotelAdminDashboardProps {
  currentUser: User | null;
  onClose: () => void;
  onSelectBookingVoucher: (booking: Booking) => void;
}

export const HotelAdminDashboard: React.FC<HotelAdminDashboardProps> = ({
  currentUser,
  onClose,
  onSelectBookingVoucher
}) => {
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    occupancyRate: '88%',
    activeRoomsCount: 0
  });

  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'analytics'>('rooms');
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [isNewRoom, setIsNewRoom] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getHotelAdminDashboard();
      setHotel(data.hotel);
      setRooms(data.rooms);
      setBookings(data.bookings);
      setStats(data.stats);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load Hotel GM dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenNewRoomModal = () => {
    setIsNewRoom(true);
    setEditingRoom({
      hotelId: hotel?.id || 'HTL-001',
      hotelName: hotel?.name || 'Luxury Hotel',
      name: '',
      type: 'suite',
      description: '',
      pricePerNight: 950,
      capacityGuests: 2,
      bedType: 'King Luxury Pillowtop',
      sizeSqFt: 900,
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
      amenities: ['Place View', 'Marble Soaking Tub', 'Hermes Amenities', '24h Butler'],
      totalInventory: 3,
      status: 'available'
    });
  };

  const handleSaveRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name) return;
    setSavingRoom(true);
    setErrorMsg('');
    try {
      const res = await api.saveRoom(editingRoom);
      if (res.success) {
        setSuccessMsg(isNewRoom ? 'New luxury suite added to Google Sheets!' : 'Suite inventory updated successfully!');
        setEditingRoom(null);
        await loadDashboardData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving room');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to remove this suite from the live Google Sheets inventory?')) return;
    try {
      await api.deleteRoom(roomId);
      setSuccessMsg('Suite removed from database.');
      await loadDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete room');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#141414] border border-[#262626] flex items-center justify-center text-[#C5A059]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-lg font-bold text-white">
                  Hotel General Manager Dashboard
                </h2>
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-[#141414] text-[#C5A059] border border-[#C5A059]/40">
                  {hotel?.name || 'Le Palais de Lumière'}
                </span>
              </div>
              <div className="text-[11px] text-[#888888]">
                Connected Property: {hotel?.city}, {hotel?.country} • Google Sheets Multi-Table Backend
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="px-3 py-1.5 rounded-sm bg-[#141414] hover:bg-[#1a1a1a] text-[#888888] hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-[#262626] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Sync Sheets</span>
            </button>
            <button
              id="close-hotel-admin-btn"
              onClick={onClose}
              className="p-1.5 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0a0a]">
          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Total Property Revenue</div>
            <div className="font-serif-luxury text-2xl font-bold text-[#C5A059] mt-1">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#888888] flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-[#C5A059]" />
              <span>Paid & confirmed bookings</span>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Occupancy Rate</div>
            <div className="font-serif-luxury text-2xl font-bold text-white mt-1">
              {stats.occupancyRate}
            </div>
            <div className="text-[10px] text-[#888888] mt-0.5">Peak season high demand</div>
          </div>

          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Confirmed Bookings</div>
            <div className="font-serif-luxury text-2xl font-bold text-white mt-1">
              {stats.confirmedBookings}
            </div>
            <div className="text-[10px] text-[#888888] mt-0.5">{stats.cancelledBookings} cancelled/refunded</div>
          </div>

          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Active Suites</div>
            <div className="font-serif-luxury text-2xl font-bold text-[#C5A059] mt-1">
              {rooms.length}
            </div>
            <div className="text-[10px] text-[#888888] mt-0.5">Live inventory in Sheets</div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-3 font-semibold uppercase tracking-wider text-[11px] border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'rooms' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-white'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Suites & Room Inventory ({rooms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 font-semibold uppercase tracking-wider text-[11px] border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'bookings' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Guest Manifest & Arrivals ({bookings.length})</span>
            </button>
          </div>

          {activeTab === 'rooms' && (
            <button
              id="add-new-room-btn"
              onClick={handleOpenNewRoomModal}
              className="px-3.5 py-1.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] flex items-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Suite</span>
            </button>
          )}
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-sm bg-[#141414] border border-[#C5A059] text-[#C5A059] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#C5A059]" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-[#C5A059] hover:text-white">✕</button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#0a0a0a]">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#888888]">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
              <span className="text-xs uppercase tracking-widest">Synchronizing property rooms from Google Sheets...</span>
            </div>
          ) : activeTab === 'rooms' ? (
            <div className="space-y-3">
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#C5A059] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={r.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                      alt={r.name}
                      className="w-16 h-16 rounded-sm object-cover border border-[#262626]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#C5A059] font-bold bg-[#0a0a0a] px-1.5 py-0.5 rounded-sm border border-[#262626]">
                          {r.id}
                        </span>
                        <h3 className="font-serif-luxury font-bold text-white text-base">{r.name}</h3>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'available' ? 'bg-[#0a0a0a] text-[#C5A059] border border-[#C5A059]/40' : 'bg-[#0a0a0a] text-[#888888] border border-[#262626]'
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#888888] mt-1 flex flex-wrap items-center gap-3">
                        <span>Rate: <strong className="text-[#C5A059] font-serif-luxury">${r.pricePerNight}</strong>/night</span>
                        <span>•</span>
                        <span>Capacity: <strong className="text-white">{r.capacityGuests} Guests</strong></span>
                        <span>•</span>
                        <span>Inventory: <strong className="text-white">{r.totalInventory} Units</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-white">{r.sizeSqFt} sq ft</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => { setEditingRoom(r); setIsNewRoom(false); }}
                      className="p-2 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1 border border-[#262626] transition-colors"
                      title="Edit Room Rate & Inventory"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(r.id)}
                      className="p-2 rounded-sm bg-[#0a0a0a] hover:bg-rose-950/60 text-rose-300 text-xs border border-rose-900/50 transition-colors"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* BOOKINGS MANIFEST */
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-[#141414] rounded-sm border border-[#262626] text-[#888888]">
                  No guest reservations recorded for this property yet.
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-sm bg-[#141414] border border-[#262626] flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#C5A059]">{b.id}</span>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'confirmed' ? 'bg-[#0a0a0a] text-[#C5A059] border border-[#C5A059]/40' : 'bg-[#0a0a0a] text-rose-300 border border-rose-900'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{b.userName} ({b.userEmail})</h4>
                      <div className="text-xs text-[#888888]">
                        Suite: <strong className="text-white">{b.roomName}</strong> • {b.checkInDate} to {b.checkOutDate} ({b.nights} nights)
                      </div>
                      {b.specialRequests && (
                        <div className="text-[11px] text-[#C5A059]/90 italic mt-1">
                          Concierge Notes: {b.specialRequests}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-[10px] text-[#888888] uppercase tracking-wider">Paid Amount</div>
                        <div className="font-serif-luxury font-bold text-[#C5A059] text-base">${b.totalAmount.toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => onSelectBookingVoucher(b)}
                        className="px-3 py-1.5 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-wider border border-[#262626] transition-colors"
                      >
                        Voucher
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* MODAL: ADD / EDIT ROOM */}
        {editingRoom && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                <h3 className="font-serif-luxury text-lg font-bold text-white">
                  {isNewRoom ? 'Add New Luxury Suite to Inventory' : `Edit Suite: ${editingRoom.name}`}
                </h3>
                <button onClick={() => setEditingRoom(null)} className="text-[#888888] hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveRoomSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Suite Name *</label>
                  <input
                    type="text"
                    value={editingRoom.name || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    required
                    placeholder="e.g. Royal Vendôme Penthouse Suite"
                    className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Suite Category</label>
                    <select
                      value={editingRoom.type || 'suite'}
                      onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value as any })}
                      className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="deluxe">Deluxe Room</option>
                      <option value="suite">Luxury Suite</option>
                      <option value="penthouse">Sky Penthouse</option>
                      <option value="presidential">Presidential Palace</option>
                      <option value="villa">Private Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Nightly Rate (USD) *</label>
                    <input
                      type="number"
                      value={editingRoom.pricePerNight || 850}
                      onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })}
                      required
                      min={100}
                      className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Guest Capacity</label>
                    <input
                      type="number"
                      value={editingRoom.capacityGuests || 2}
                      onChange={(e) => setEditingRoom({ ...editingRoom, capacityGuests: Number(e.target.value) })}
                      min={1}
                      max={10}
                      className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Size (Sq Ft)</label>
                    <input
                      type="number"
                      value={editingRoom.sizeSqFt || 950}
                      onChange={(e) => setEditingRoom({ ...editingRoom, sizeSqFt: Number(e.target.value) })}
                      className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Total Inventory</label>
                    <input
                      type="number"
                      value={editingRoom.totalInventory || 3}
                      onChange={(e) => setEditingRoom({ ...editingRoom, totalInventory: Number(e.target.value) })}
                      min={1}
                      className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={editingRoom.bedType || 'King Luxury Pillowtop'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedType: e.target.value })}
                    className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingRoom.description || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                    placeholder="Describe the architectural finishes, balcony views, and perks..."
                    className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setEditingRoom(null)}
                    className="px-4 py-2 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRoom}
                    className="px-5 py-2 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] flex items-center gap-1.5 transition-colors"
                  >
                    {savingRoom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save to Google Sheets</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
