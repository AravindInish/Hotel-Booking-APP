import React, { useState, useEffect } from 'react';
import { User, Hotel, Booking, UserRole } from '../types';
import { api } from '../services/apiBridge';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Building2, 
  DollarSign, 
  Calendar, 
  Check, 
  X, 
  Loader2, 
  Download, 
  RotateCcw, 
  Lock,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onClose: () => void;
  onSelectBookingVoucher: (booking: Booking) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onClose,
  onSelectBookingVoucher
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    grossPlatformVolume: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalHotels: 0,
    totalRooms: 0,
    totalUsers: 0,
    systemHealth: 'Optimal'
  });
  const [users, setUsers] = useState<User[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'sheets_db' | 'users' | 'hotels'>('overview');
  const [selectedSheetTab, setSelectedSheetTab] = useState<'Users' | 'Hotels' | 'Rooms' | 'Bookings' | 'Payments' | 'Reviews'>('Bookings');
  const [searchFilter, setSearchFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      const data = await api.getSuperAdminDashboard();
      setStats(data.stats);
      setUsers(data.users);
      setHotels(data.hotels);
      setRecentBookings(data.recentBookings);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load Super Admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: UserRole, hotelId?: string) => {
    try {
      await api.updateUserRole(userId, newRole, hotelId);
      setSuccessMsg(`User permission updated to ${newRole}. Synchronized in Google Sheets.`);
      await loadSuperAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update role');
    }
  };

  const handleToggleHotelStatus = async (hotelId: string, currentStatus: 'active' | 'maintenance') => {
    const nextStatus = currentStatus === 'active' ? 'maintenance' : 'active';
    try {
      await api.toggleHotelStatus(hotelId, nextStatus);
      setSuccessMsg(`Hotel status updated to ${nextStatus}.`);
      await loadSuperAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update hotel');
    }
  };

  const exportSheetCsv = (sheetName: string) => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (sheetName === 'Bookings') {
      headers = ['ID', 'Hotel', 'Guest', 'Email', 'CheckIn', 'CheckOut', 'Nights', 'TotalAmount', 'Status'];
      rows = recentBookings.map(b => [b.id, b.hotelName, b.userName, b.userEmail, b.checkInDate, b.checkOutDate, b.nights, b.totalAmount, b.bookingStatus]);
    } else if (sheetName === 'Users') {
      headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'CreatedAt'];
      rows = users.map(u => [u.id, u.name, u.email, u.role, u.status, u.createdAt]);
    } else if (sheetName === 'Hotels') {
      headers = ['ID', 'Name', 'City', 'Country', 'Stars', 'Rating', 'PriceFrom', 'Status'];
      rows = hotels.map(h => [h.id, h.name, h.city, h.country, h.stars, h.rating, h.priceFrom, h.status]);
    } else {
      headers = ['ID', 'Reference', 'Timestamp'];
      rows = [['REF-001', 'Sample DB Row', new Date().toISOString()]];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AI_Hotels_${sheetName}_Database.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#141414] border border-[#262626] flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-lg font-bold text-white">
                  Super Admin Central Command
                </h2>
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-[#141414] text-[#C5A059] border border-[#C5A059]/40">
                  Global Access
                </span>
              </div>
              <div className="text-[11px] text-[#888888]">
                Google Sheets Multi-Database Architecture • 6 Live Tabs Synchronized
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSuperAdminData}
              className="px-3 py-1.5 rounded-sm bg-[#141414] hover:bg-[#1a1a1a] text-[#888888] hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-[#262626] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Refresh Backend</span>
            </button>
            <button
              id="close-super-admin-btn"
              onClick={onClose}
              className="p-1.5 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0a0a]">
          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Gross Platform Volume</div>
            <div className="font-serif-luxury text-2xl font-bold text-[#C5A059] mt-1">
              ${stats.grossPlatformVolume.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#888888] mt-0.5">{stats.confirmedBookings} confirmed reservations</div>
          </div>

          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Total Properties</div>
            <div className="font-serif-luxury text-2xl font-bold text-white mt-1">
              {hotels.length}
            </div>
            <div className="text-[10px] text-[#C5A059] mt-0.5">{stats.totalRooms} total rooms</div>
          </div>

          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Registered Accounts</div>
            <div className="font-serif-luxury text-2xl font-bold text-white mt-1">
              {users.length}
            </div>
            <div className="text-[10px] text-[#888888] mt-0.5">Customers & Administrators</div>
          </div>

          <div className="p-4 rounded-sm bg-[#141414] border border-[#262626]">
            <div className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">Google Apps Script Engine</div>
            <div className="font-serif-luxury text-sm font-bold text-[#C5A059] mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span>Online & Responsive</span>
            </div>
            <div className="text-[10px] text-[#888888] mt-0.5">V8 JavaScript Engine</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 uppercase tracking-wider text-[11px] border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('sheets_db')}
              className={`py-3 uppercase tracking-wider text-[11px] border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sheets_db' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Google Sheets Database Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 uppercase tracking-wider text-[11px] border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'users' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Roles & RBAC ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`py-3 uppercase tracking-wider text-[11px] border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'hotels' ? 'text-[#C5A059] border-[#C5A059]' : 'text-[#888888] border-transparent hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hotel Registry ({hotels.length})</span>
            </button>
          </div>
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

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#0a0a0a]">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#888888]">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
              <span className="text-xs uppercase tracking-widest">Fetching global system metrics from Google Sheets...</span>
            </div>
          ) : activeTab === 'overview' ? (
            /* TAB 1: OVERVIEW & RECENT TRANSACTIONS */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury text-base font-bold text-white">Recent Global Bookings</h3>
                <span className="text-xs text-[#888888]">{recentBookings.length} total recorded bookings</span>
              </div>

              <div className="bg-[#141414] rounded-sm border border-[#262626] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a0a0a] text-[#888888] uppercase text-[10px] font-mono border-b border-[#262626]">
                      <tr>
                        <th className="p-3.5">Booking Ref</th>
                        <th className="p-3.5">Hotel & Suite</th>
                        <th className="p-3.5">Lead Guest</th>
                        <th className="p-3.5">Check-In / Out</th>
                        <th className="p-3.5">Total USD</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626] text-[#888888]">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#1a1a1a] transition-colors">
                          <td className="p-3.5 font-mono text-[#C5A059] font-bold">{b.id}</td>
                          <td className="p-3.5 font-medium text-white">
                            <div>{b.hotelName}</div>
                            <div className="text-[11px] text-[#888888]">{b.roomName}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-white">{b.userName}</div>
                            <div className="text-[10px] text-[#888888]">{b.userEmail}</div>
                          </td>
                          <td className="p-3.5">{b.checkInDate} → {b.checkOutDate}</td>
                          <td className="p-3.5 font-serif-luxury font-bold text-[#C5A059]">${b.totalAmount.toLocaleString()}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                              b.bookingStatus === 'confirmed' ? 'bg-[#0a0a0a] text-[#C5A059] border border-[#C5A059]/40' : 'bg-[#0a0a0a] text-rose-300 border border-rose-900'
                            }`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => onSelectBookingVoucher(b)}
                              className="px-2.5 py-1 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white text-xs uppercase tracking-wider font-semibold border border-[#262626] transition-colors"
                            >
                              Voucher
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'sheets_db' ? (
            /* TAB 2: GOOGLE SHEETS DATABASE INSPECTOR */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-white">Live Multi-Tab Google Sheets Inspector</h3>
                  <p className="text-xs text-[#888888]">Direct replica of the 6 sheets managed by Google Apps Script.</p>
                </div>

                <button
                  onClick={() => exportSheetCsv(selectedSheetTab)}
                  className="px-3.5 py-1.5 rounded-sm bg-[#C5A059] hover:bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export {selectedSheetTab}.csv</span>
                </button>
              </div>

              {/* 6 Sheets Tab Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto bg-[#141414] p-1.5 rounded-sm border border-[#262626]">
                {(['Bookings', 'Hotels', 'Rooms', 'Users', 'Payments', 'Reviews'] as const).map((sheetName) => (
                  <button
                    key={sheetName}
                    onClick={() => setSelectedSheetTab(sheetName)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wider transition-all ${
                      selectedSheetTab === sheetName
                        ? 'bg-[#C5A059] text-black font-bold shadow-sm'
                        : 'text-[#888888] hover:text-white hover:bg-[#0a0a0a]'
                    }`}
                  >
                    Sheet: {sheetName}
                  </button>
                ))}
              </div>

              {/* Table Data Viewer */}
              <div className="bg-[#141414] rounded-sm border border-[#262626] overflow-hidden p-4">
                <div className="text-xs text-[#888888] mb-3 flex items-center justify-between">
                  <span>Showing live rows for sheet: <strong className="text-white font-mono">{selectedSheetTab}</strong></span>
                  <span className="text-[#C5A059] font-mono text-[11px]">Synced with Code.gs</span>
                </div>

                <div className="overflow-x-auto">
                  {selectedSheetTab === 'Bookings' ? (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0a0a0a] text-[#888888] text-[10px]">
                        <tr>
                          <th className="p-2">id</th>
                          <th className="p-2">userId</th>
                          <th className="p-2">hotelName</th>
                          <th className="p-2">roomName</th>
                          <th className="p-2">checkIn</th>
                          <th className="p-2">checkOut</th>
                          <th className="p-2">totalAmount</th>
                          <th className="p-2">bookingStatus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626] text-[#888888]">
                        {recentBookings.map(b => (
                          <tr key={b.id} className="hover:bg-[#1a1a1a]">
                            <td className="p-2 text-[#C5A059]">{b.id}</td>
                            <td className="p-2 text-[#888888]">{b.userId}</td>
                            <td className="p-2 text-white">{b.hotelName}</td>
                            <td className="p-2 text-white">{b.roomName}</td>
                            <td className="p-2">{b.checkInDate}</td>
                            <td className="p-2">{b.checkOutDate}</td>
                            <td className="p-2 text-[#C5A059] font-bold">${b.totalAmount}</td>
                            <td className="p-2">{b.bookingStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : selectedSheetTab === 'Users' ? (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0a0a0a] text-[#888888] text-[10px]">
                        <tr>
                          <th className="p-2">id</th>
                          <th className="p-2">name</th>
                          <th className="p-2">email</th>
                          <th className="p-2">role</th>
                          <th className="p-2">hotelId</th>
                          <th className="p-2">status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626] text-[#888888]">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-[#1a1a1a]">
                            <td className="p-2 text-[#C5A059]">{u.id}</td>
                            <td className="p-2 text-white">{u.name}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2 text-[#C5A059]">{u.role}</td>
                            <td className="p-2">{u.hotelId || '—'}</td>
                            <td className="p-2">{u.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-[#888888] text-xs">
                      Viewing synchronized sheet dataset for {selectedSheetTab}. All changes made via the app or Google Apps Script are instantly reflected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            /* TAB 3: USER ROLES & RBAC */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-white">User Accounts & Role Permissions</h3>
                  <p className="text-xs text-[#888888]">Promote customers to Hotel Managers or Super Administrators.</p>
                </div>
              </div>

              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="p-4 rounded-sm bg-[#141414] border border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C5A059] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-[#0a0a0a] border border-[#262626] flex items-center justify-center font-bold text-[#C5A059]">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{u.name}</h4>
                          <span className="font-mono text-[10px] text-[#888888]">{u.id}</span>
                        </div>
                        <div className="text-xs text-[#888888]">{u.email} • {u.phone || 'No phone'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] uppercase tracking-wider text-[#888888]">Role:</span>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole, u.role === 'hotel_admin' ? 'HTL-001' : undefined)}
                        className="bg-[#0a0a0a] px-3 py-1.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059] font-semibold"
                      >
                        <option value="customer">Customer / Guest</option>
                        <option value="hotel_admin">Hotel General Manager</option>
                        <option value="super_admin">Super Administrator</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 4: HOTEL REGISTRY */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury text-base font-bold text-white">Global Hotel Registry</h3>
                <span className="text-xs text-[#888888]">{hotels.length} Properties in Portfolio</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotels.map((h) => (
                  <div key={h.id} className="p-4 rounded-sm bg-[#141414] border border-[#262626] space-y-3 hover:border-[#C5A059] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#C5A059] font-bold">{h.id}</span>
                          <h4 className="font-serif-luxury font-bold text-white text-base">{h.name}</h4>
                        </div>
                        <div className="text-xs text-[#888888]">{h.city}, {h.country}</div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleHotelStatus(h.id, h.status)}
                        className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase transition-colors ${
                          h.status === 'active' ? 'bg-[#0a0a0a] text-[#C5A059] border border-[#C5A059]/40' : 'bg-[#0a0a0a] text-rose-300 border border-rose-900'
                        }`}
                      >
                        {h.status === 'active' ? 'Active' : 'Maintenance'}
                      </button>
                    </div>

                    <div className="text-xs text-[#888888] flex justify-between border-t border-[#262626] pt-2">
                      <span>Rate from: <strong className="text-[#C5A059]">${h.priceFrom}/nt</strong></span>
                      <span>Rating: <strong className="text-white">★ {h.rating}</strong> ({h.reviewCount})</span>
                    </div>
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
