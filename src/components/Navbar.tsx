import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Building2, 
  CalendarCheck2, 
  ShieldCheck, 
  UserCircle, 
  LogOut, 
  Sparkles, 
  Code2, 
  Layers, 
  KeyRound, 
  Check, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeRole?: UserRole;
  bookingCount?: number;
  onOpenBookings?: () => void;
  onOpenMyBookings?: () => void;
  onOpenAuth: () => void;
  onOpenHotelAdmin: () => void;
  onOpenSuperAdmin: () => void;
  onOpenGasHub?: () => void;
  onOpenDeploymentGuide?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onLogout: () => void;
  activeView?: 'home' | 'hotel_admin' | 'super_admin';
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  bookingCount = 0,
  onOpenBookings,
  onOpenMyBookings,
  onOpenAuth,
  onOpenHotelAdmin,
  onOpenSuperAdmin,
  onOpenGasHub,
  onOpenDeploymentGuide,
  onSwitchRole,
  onRoleChange,
  onLogout,
  activeView = 'home',
  onNavigateHome
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentRole: UserRole = activeRole || currentUser?.role || 'customer';
  const handleOpenBookings = onOpenBookings || onOpenMyBookings || (() => {});
  const handleOpenGasHub = onOpenGasHub || onOpenDeploymentGuide || (() => {});
  const handleSwitchRole = onSwitchRole || onRoleChange || (() => {});
  const handleNavigateHome = onNavigateHome || (() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'hotel_admin': return 'Hotel GM';
      default: return 'Guest';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-[#141414] text-[#C5A059] border-[#C5A059]/60';
      case 'hotel_admin': return 'bg-[#141414] text-[#C5A059] border-[#C5A059]/60';
      default: return 'bg-[#141414] text-[#C5A059] border-[#C5A059]/60';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            id="nav-brand-logo"
            onClick={handleNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-sm bg-[#C5A059] flex items-center justify-center shadow-lg group-hover:bg-[#d4af37] transition-colors duration-200">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-luxury text-xl font-bold tracking-widest text-[#C5A059]">AI HOTELS</span>
                <span className="text-[#888888] font-light text-xl">&</span>
                <span className="font-serif-luxury text-xl font-light tracking-widest text-white">ROOMS</span>
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#888888] font-medium flex items-center gap-1.5">
                <span>Google Apps Script</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#C5A059]"></span>
                <span className="text-[#C5A059]">Sheets DB</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-medium">
            <button
              id="nav-link-explore"
              onClick={handleNavigateHome}
              className={`px-4 py-2 rounded-sm transition-colors ${activeView === 'home' ? 'text-[#C5A059] bg-[#141414] border border-[#262626]' : 'text-[#888888] hover:text-[#e0e0e0] hover:bg-[#141414]'}`}
            >
              Explore Stays
            </button>
            
            {(currentRole === 'hotel_admin' || currentUser?.role === 'hotel_admin') && (
              <button
                id="nav-link-hotel-admin"
                onClick={onOpenHotelAdmin}
                className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-colors ${activeView === 'hotel_admin' ? 'text-[#C5A059] bg-[#141414] border border-[#262626]' : 'text-[#888888] hover:text-[#e0e0e0] hover:bg-[#141414]'}`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Hotel GM</span>
              </button>
            )}

            {(currentRole === 'super_admin' || currentUser?.role === 'super_admin') && (
              <button
                id="nav-link-super-admin"
                onClick={onOpenSuperAdmin}
                className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-colors ${activeView === 'super_admin' ? 'text-[#C5A059] bg-[#141414] border border-[#262626]' : 'text-[#888888] hover:text-[#e0e0e0] hover:bg-[#141414]'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Super Admin</span>
              </button>
            )}

            <button
              id="nav-link-gashub"
              onClick={handleOpenGasHub}
              className="px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 text-xs font-mono bg-[#141414] text-[#C5A059] border border-[#262626] hover:border-[#C5A059] transition-all"
              title="Google Apps Script & Google Sheets Source Code & Schemas"
            >
              <Code2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Code.gs & Sheets</span>
            </button>
          </nav>

          {/* Right Action Toolbar */}
          <div className="flex items-center gap-3">

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`px-3 py-1 rounded-sm text-xs font-medium border flex items-center gap-1.5 uppercase tracking-wider transition-all ${getRoleBadgeColor(currentRole)}`}
                title="Switch role mode to test Customer, Hotel Admin, or Super Admin permissions"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                <span>Role: {getRoleLabel(currentRole)}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-sm bg-[#141414] border border-[#262626] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-widest border-b border-[#262626] mb-1">
                    Simulate User Role
                  </div>
                  <button
                    onClick={() => { handleSwitchRole('customer'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-sm text-xs flex items-center justify-between text-[#e0e0e0] hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">Guest / Customer</div>
                      <div className="text-[11px] text-[#888888]">Search, book & view bookings</div>
                    </div>
                    {currentRole === 'customer' && <Check className="w-4 h-4 text-[#C5A059]" />}
                  </button>
                  <button
                    onClick={() => { handleSwitchRole('hotel_admin'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-sm text-xs flex items-center justify-between text-[#e0e0e0] hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-[#C5A059]">Hotel Admin (GM)</div>
                      <div className="text-[11px] text-[#888888]">Manage rooms, rates & arrivals</div>
                    </div>
                    {currentRole === 'hotel_admin' && <Check className="w-4 h-4 text-[#C5A059]" />}
                  </button>
                  <button
                    onClick={() => { handleSwitchRole('super_admin'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-sm text-xs flex items-center justify-between text-[#e0e0e0] hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-[#C5A059]">Super Admin</div>
                      <div className="text-[11px] text-[#888888]">All hotels, users & platform stats</div>
                    </div>
                    {currentRole === 'super_admin' && <Check className="w-4 h-4 text-[#C5A059]" />}
                  </button>
                </div>
              )}
            </div>

            {/* My Bookings Button */}
            <button
              id="my-bookings-btn"
              onClick={handleOpenBookings}
              className="relative p-2 rounded-sm bg-[#141414] border border-[#262626] text-[#e0e0e0] hover:text-[#C5A059] hover:border-[#C5A059]/60 transition-all flex items-center gap-2 text-xs uppercase tracking-wider px-3"
              title="My Reservations"
            >
              <CalendarCheck2 className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden sm:inline">Stays</span>
              {bookingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#C5A059] text-black">
                  {bookingCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#C5A059]/60 transition-all"
                >
                  <div className="text-left hidden lg:block pr-1">
                    <div className="text-xs font-semibold text-[#e0e0e0] line-clamp-1 max-w-[120px]">{currentUser.name}</div>
                    <div className="text-[10px] text-[#888888]">{currentUser.email}</div>
                  </div>
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      className="w-8 h-8 rounded-full object-cover border border-[#C5A059]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#C5A059] font-bold border border-[#C5A059] flex items-center justify-center text-xs">
                      {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-sm bg-[#141414] border border-[#262626] shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-[#262626] mb-1">
                      <div className="text-sm font-bold text-white">{currentUser.name}</div>
                      <div className="text-xs text-[#888888]">{currentUser.email}</div>
                      <div className="text-[10px] uppercase font-mono tracking-widest mt-1 text-[#C5A059]">
                        {getRoleLabel(currentUser.role)}
                      </div>
                    </div>
                    <button
                      onClick={() => { handleOpenBookings(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-sm text-xs text-[#e0e0e0] hover:bg-[#1a1a1a] flex items-center gap-2"
                    >
                      <CalendarCheck2 className="w-4 h-4 text-[#C5A059]" />
                      <span>My Reservations & Vouchers</span>
                    </button>
                    {(currentUser.role === 'hotel_admin' || currentRole === 'hotel_admin') && (
                      <button
                        onClick={() => { onOpenHotelAdmin(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-sm text-xs text-[#e0e0e0] hover:bg-[#1a1a1a] flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-[#C5A059]" />
                        <span>Hotel Manager Dashboard</span>
                      </button>
                    )}
                    {(currentUser.role === 'super_admin' || currentRole === 'super_admin') && (
                      <button
                        onClick={() => { onOpenSuperAdmin(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-sm text-xs text-[#e0e0e0] hover:bg-[#1a1a1a] flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                        <span>Super Admin Portal</span>
                      </button>
                    )}
                    <button
                      onClick={() => { handleOpenGasHub(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-sm text-xs text-[#e0e0e0] hover:bg-[#1a1a1a] flex items-center gap-2"
                    >
                      <Code2 className="w-4 h-4 text-[#C5A059]" />
                      <span>Apps Script Source & Sheets</span>
                    </button>
                    <div className="border-t border-[#262626] my-1"></div>
                    <button
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-sm text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="sign-in-nav-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest bg-[#C5A059] text-black hover:bg-[#d4af37] shadow-md transition-all flex items-center gap-1.5"
              >
                <UserCircle className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 md:hidden rounded-sm bg-[#141414] border border-[#262626] text-[#e0e0e0] hover:text-white"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden py-4 border-t border-[#262626] space-y-2">
            <button
              onClick={() => { handleNavigateHome(); setMobileNavOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider text-[#e0e0e0] hover:bg-[#141414]"
            >
              Explore Stays
            </button>
            <button
              onClick={() => { handleOpenBookings(); setMobileNavOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider text-[#e0e0e0] hover:bg-[#141414] flex items-center justify-between"
            >
              <span>My Reservations</span>
              {bookingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#C5A059] text-black">
                  {bookingCount}
                </span>
              )}
            </button>
            {(currentRole === 'hotel_admin' || currentUser?.role === 'hotel_admin') && (
              <button
                onClick={() => { onOpenHotelAdmin(); setMobileNavOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider text-[#C5A059] hover:bg-[#141414] flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Hotel GM Dashboard</span>
              </button>
            )}
            {(currentRole === 'super_admin' || currentUser?.role === 'super_admin') && (
              <button
                onClick={() => { onOpenSuperAdmin(); setMobileNavOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider text-[#C5A059] hover:bg-[#141414] flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Super Admin Portal</span>
              </button>
            )}
            <button
              onClick={() => { handleOpenGasHub(); setMobileNavOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider text-[#C5A059] hover:bg-[#141414] flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              <span>Google Apps Script Hub</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
