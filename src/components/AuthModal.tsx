import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/apiBridge';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Check, 
  Loader2, 
  KeyRound,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: regRole,
        hotelId: regRole === 'hotel_admin' ? 'HTL-001' : undefined
      });
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.resetPassword(email);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = (userRole: UserRole) => {
    if (userRole === 'customer') {
      setEmail('sophia@luxury.com');
      setPassword('guest123');
    } else if (userRole === 'hotel_admin') {
      setEmail('gm.paris@aihotels.com');
      setPassword('hotel123');
    } else if (userRole === 'super_admin') {
      setEmail('admin@aihotels.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-md bg-[#0a0a0a] rounded-sm border border-[#262626] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">AI Hotels Access Portal</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-[#141414] border border-[#262626] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 border-b border-[#262626] text-[11px] font-semibold uppercase tracking-wider text-center">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 transition-colors ${tab === 'login' ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-[#141414]' : 'text-[#888888] hover:text-white bg-[#0a0a0a]'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 transition-colors ${tab === 'register' ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-[#141414]' : 'text-[#888888] hover:text-white bg-[#0a0a0a]'}`}
          >
            New Guest
          </button>
          <button
            onClick={() => { setTab('reset'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 transition-colors ${tab === 'reset' ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-[#141414]' : 'text-[#888888] hover:text-white bg-[#0a0a0a]'}`}
          >
            Reset Key
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 bg-[#0a0a0a]">
          
          {errorMsg && (
            <div className="p-3 rounded-sm bg-[#141414] border border-rose-800/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-sm bg-[#141414] border border-[#C5A059] text-[#C5A059] text-xs">
              {successMsg}
            </div>
          )}

          {/* Quick Demo Credentials Bar */}
          {tab === 'login' && (
            <div className="p-3 rounded-sm bg-[#141414] border border-[#262626] space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">1-Click Fast Auth (Demo):</div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => quickLoginAs('customer')}
                  className="p-1.5 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#888888] hover:text-white font-medium border border-[#262626] text-center uppercase tracking-wider"
                >
                  Guest VIP
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs('hotel_admin')}
                  className="p-1.5 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#C5A059] font-medium border border-[#262626] text-center uppercase tracking-wider"
                >
                  Hotel GM
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs('super_admin')}
                  className="p-1.5 rounded-sm bg-[#0a0a0a] hover:bg-[#1a1a1a] text-purple-300 font-medium border border-[#262626] text-center uppercase tracking-wider"
                >
                  Super Admin
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@luxury.com"
                    className="w-full bg-[#141414] pl-10 pr-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#141414] pl-10 pr-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] shadow-md flex items-center justify-center gap-1.5 mt-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Sign In to Portal</span>
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="e.g. Duke Alexander Montgomery"
                  className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="alexander@domain.com"
                  className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Account Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-[#141414] px-3.5 py-2 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="customer">Customer / Guest</option>
                  <option value="hotel_admin">Hotel General Manager</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-sm bg-[#C5A059] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] shadow-md flex items-center justify-center gap-1.5 mt-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Create Verified Account</span>
              </button>
            </form>
          )}

          {/* TAB 3: RESET PASSWORD */}
          {tab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3">
              <p className="text-xs text-[#888888] leading-relaxed">
                Enter your registered email address. A temporary access key will be generated and synchronized with Google Sheets.
              </p>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@luxury.com"
                  className="w-full bg-[#141414] px-3.5 py-2.5 rounded-sm text-white text-xs border border-[#262626] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-sm bg-[#141414] hover:bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider border border-[#262626] flex items-center justify-center gap-1.5 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4 text-[#C5A059]" />}
                <span>Send Temporary Access Code</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
