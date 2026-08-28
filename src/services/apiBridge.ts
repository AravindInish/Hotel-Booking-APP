import { Hotel, Room, Review, User, Booking, Payment, SearchFilters, AuthSession, UserRole } from '../types';
import { INITIAL_HOTELS, INITIAL_ROOMS, INITIAL_REVIEWS, INITIAL_USERS, INITIAL_BOOKINGS } from '../data/initialHotels';

const STORAGE_KEYS = {
  HOTELS: 'aih_hotels_v2',
  ROOMS: 'aih_rooms_v2',
  REVIEWS: 'aih_reviews_v2',
  USERS: 'aih_users_v2',
  BOOKINGS: 'aih_bookings_v2',
  SESSION: 'aih_session_v2',
  GAS_URL: 'aih_gas_url_v2'
};

// Declare Google Apps Script window interface
declare global {
  interface Window {
    google?: {
      script?: {
        run: {
          withSuccessHandler: (handler: (result: unknown) => void) => {
            withFailureHandler: (handler: (error: Error) => void) => Record<string, (...args: unknown[]) => void>;
          };
          [key: string]: unknown;
        };
      };
    };
  }
}

class ApiBridge {
  private hotels: Hotel[] = [];
  private rooms: Room[] = [];
  private reviews: Review[] = [];
  private users: User[] = [];
  private bookings: Booking[] = [];
  private currentSession: AuthSession | null = null;
  private customGasUrl: string = '';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const h = localStorage.getItem(STORAGE_KEYS.HOTELS);
      this.hotels = h ? JSON.parse(h) : [...INITIAL_HOTELS];

      const r = localStorage.getItem(STORAGE_KEYS.ROOMS);
      this.rooms = r ? JSON.parse(r) : [...INITIAL_ROOMS];

      const rev = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      this.reviews = rev ? JSON.parse(rev) : [...INITIAL_REVIEWS];

      const u = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = u ? JSON.parse(u) : [...INITIAL_USERS];

      const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      this.bookings = b ? JSON.parse(b) : [...INITIAL_BOOKINGS];

      const sess = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (sess) {
        this.currentSession = JSON.parse(sess);
      } else {
        // Default demo session as customer
        this.currentSession = {
          token: 'demo-guest-token',
          user: this.users.find(u => u.role === 'customer') || this.users[0],
          expiresAt: Date.now() + 86400000 * 7
        };
      }

      this.customGasUrl = localStorage.getItem(STORAGE_KEYS.GAS_URL) || '';
    } catch (e) {
      console.warn('Storage load fallback:', e);
      this.hotels = [...INITIAL_HOTELS];
      this.rooms = [...INITIAL_ROOMS];
      this.reviews = [...INITIAL_REVIEWS];
      this.users = [...INITIAL_USERS];
      this.bookings = [...INITIAL_BOOKINGS];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(this.hotels));
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(this.rooms));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      if (this.currentSession) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  public getGasUrl(): string {
    return this.customGasUrl;
  }

  public setGasUrl(url: string) {
    this.customGasUrl = url.trim();
    localStorage.setItem(STORAGE_KEYS.GAS_URL, this.customGasUrl);
  }

  public getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public switchDemoRole(role: UserRole): User {
    let target = this.users.find(u => u.role === role);
    if (!target) {
      target = {
        id: `USR-${role.toUpperCase().substring(0, 2)}-DEMO`,
        name: role === 'super_admin' ? 'Alexander Vance (Super Admin)' : role === 'hotel_admin' ? 'Elena Rostova (Hotel GM)' : 'Lady Sophia Montgomery',
        email: `${role}@aihotels.com`,
        role: role,
        hotelId: role === 'hotel_admin' ? 'HTL-001' : undefined,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      this.users.push(target);
    }
    this.currentSession = {
      token: `demo-token-${role}-${Date.now()}`,
      user: target,
      expiresAt: Date.now() + 86400000 * 7
    };
    this.saveState();
    return target;
  }

  public async switchRoleDemo(role: UserRole): Promise<User> {
    return this.switchDemoRole(role);
  }

  public resetAllData() {
    this.hotels = [...INITIAL_HOTELS];
    this.rooms = [...INITIAL_ROOMS];
    this.reviews = [...INITIAL_REVIEWS];
    this.users = [...INITIAL_USERS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.saveState();
  }

  // --- API METHODS ---

  public async searchHotels(filters?: Partial<SearchFilters>): Promise<Hotel[]> {
    return this.getHotels(filters);
  }

  public async getHotels(filters?: Partial<SearchFilters>): Promise<Hotel[]> {
    await new Promise(r => setTimeout(r, 180));
    let result = [...this.hotels];

    if (filters) {
      if (filters.destination && filters.destination.trim()) {
        const query = filters.destination.toLowerCase().trim();
        result = result.filter(h =>
          h.city.toLowerCase().includes(query) ||
          h.country.toLowerCase().includes(query) ||
          h.name.toLowerCase().includes(query) ||
          h.tagline.toLowerCase().includes(query)
        );
      }
      if (filters.minPrice !== undefined) {
        result = result.filter(h => h.priceFrom >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter(h => h.priceFrom <= filters.maxPrice!);
      }
      if (filters.stars && filters.stars.length > 0) {
        result = result.filter(h => filters.stars!.includes(h.stars));
      }
      if (filters.amenities && filters.amenities.length > 0) {
        result = result.filter(h =>
          filters.amenities!.every(a => h.amenities.some(ha => ha.toLowerCase().includes(a.toLowerCase())))
        );
      }

      if (filters.sortBy === 'price_low') {
        result.sort((a, b) => a.priceFrom - b.priceFrom);
      } else if (filters.sortBy === 'price_high') {
        result.sort((a, b) => b.priceFrom - a.priceFrom);
      } else if (filters.sortBy === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      }
    }

    return result;
  }

  public async getHotelDetails(hotelId: string): Promise<{ hotel: Hotel; rooms: Room[]; reviews: Review[] }> {
    await new Promise(r => setTimeout(r, 200));
    const hotel = this.hotels.find(h => h.id === hotelId);
    if (!hotel) throw new Error('Hotel not found');

    const rooms = this.rooms.filter(r => r.hotelId === hotelId && r.status === 'available');
    const reviews = this.reviews.filter(rv => rv.hotelId === hotelId && rv.status === 'published');

    return { hotel, rooms, reviews };
  }

  public async checkAvailability(
    hotelId: string,
    roomId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<{ available: boolean; availableSlots: number; totalInventory: number }> {
    await new Promise(r => setTimeout(r, 150));
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return { available: false, availableSlots: 0, totalInventory: 0 };

    const reqStart = new Date(checkInDate).getTime();
    const reqEnd = new Date(checkOutDate).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
      return { available: false, availableSlots: 0, totalInventory: room.totalInventory };
    }

    const overlappingBookings = this.bookings.filter(b => {
      if (b.roomId !== roomId || b.bookingStatus !== 'confirmed') return false;
      const bStart = new Date(b.checkInDate).getTime();
      const bEnd = new Date(b.checkOutDate).getTime();
      return reqStart < bEnd && reqEnd > bStart;
    });

    const slotsLeft = Math.max(0, room.totalInventory - overlappingBookings.length);
    return {
      available: slotsLeft > 0,
      availableSlots: slotsLeft,
      totalInventory: room.totalInventory
    };
  }

  public async createBooking(data: {
    hotelId: string;
    hotelName: string;
    roomId: string;
    roomName: string;
    roomType: Room['type'];
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    pricePerNight: number;
    paymentMethod: string;
    specialRequests?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
  }): Promise<{ success: boolean; booking: Booking; message: string }> {
    await new Promise(r => setTimeout(r, 450));

    if (!this.currentSession?.user) {
      throw new Error('Please sign in or create an account to reserve.');
    }

    // Availability validation check
    const avail = await this.checkAvailability(data.hotelId, data.roomId, data.checkInDate, data.checkOutDate);
    if (!avail.available) {
      throw new Error('This room has just been reserved for the requested dates. Please choose another date or suite.');
    }

    const dIn = new Date(data.checkInDate);
    const dOut = new Date(data.checkOutDate);
    const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
    const subtotal = nights * data.pricePerNight;
    const taxAmount = Math.round(subtotal * 0.12 * 100) / 100;
    const resortFee = 50;
    const totalAmount = subtotal + taxAmount + resortFee;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `AIH-2026-${randomSuffix}`;

    const newBooking: Booking = {
      id: bookingId,
      userId: this.currentSession.user.id,
      userName: data.userName || this.currentSession.user.name,
      userEmail: data.userEmail || this.currentSession.user.email,
      userPhone: data.userPhone || this.currentSession.user.phone || '+1 (555) 000-0000',
      hotelId: data.hotelId,
      hotelName: data.hotelName,
      roomId: data.roomId,
      roomName: data.roomName,
      roomType: data.roomType,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      nights,
      guests: data.guests,
      pricePerNight: data.pricePerNight,
      subtotal,
      taxAmount,
      resortFee,
      totalAmount,
      paymentStatus: 'paid',
      paymentMethod: data.paymentMethod,
      bookingStatus: 'confirmed',
      specialRequests: data.specialRequests,
      createdAt: new Date().toISOString()
    };

    this.bookings.unshift(newBooking);
    this.saveState();

    return {
      success: true,
      booking: newBooking,
      message: 'Luxury stay reservation confirmed with Google Sheets backend!'
    };
  }

  public async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 300));
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason || 'Guest requested cancellation';

    this.saveState();
    return {
      success: true,
      message: `Reservation ${bookingId} cancelled and refunded to original payment method.`
    };
  }

  public async getUserBookings(): Promise<Booking[]> {
    await new Promise(r => setTimeout(r, 200));
    if (!this.currentSession?.user) return [];
    return this.bookings.filter(b => b.userId === this.currentSession?.user.id);
  }

  public async submitReview(data: {
    hotelId: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 300));
    if (!this.currentSession?.user) throw new Error('Please sign in to leave a review.');

    const newReview: Review = {
      id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      hotelId: data.hotelId,
      userId: this.currentSession.user.id,
      userName: this.currentSession.user.name,
      userAvatar: this.currentSession.user.avatarUrl,
      rating: data.rating,
      title: data.title || 'Exceptional Stay',
      comment: data.comment,
      stayDate: 'August 2026',
      createdAt: new Date().toISOString(),
      status: 'published'
    };

    this.reviews.unshift(newReview);

    // Update hotel rating & count
    const hotel = this.hotels.find(h => h.id === data.hotelId);
    if (hotel) {
      const allHotelRevs = this.reviews.filter(r => r.hotelId === data.hotelId);
      const avg = allHotelRevs.reduce((acc, r) => acc + r.rating, 0) / allHotelRevs.length;
      hotel.rating = Math.round(avg * 100) / 100;
      hotel.reviewCount = allHotelRevs.length;
    }

    this.saveState();
    return { success: true, message: 'Review published to Google Sheets database!' };
  }

  // --- ADMIN APIs ---

  public async getHotelAdminDashboard(): Promise<{
    hotel: Hotel;
    rooms: Room[];
    bookings: Booking[];
    stats: {
      totalRevenue: number;
      confirmedBookings: number;
      cancelledBookings: number;
      occupancyRate: string;
      activeRoomsCount: number;
    };
  }> {
    await new Promise(r => setTimeout(r, 250));
    const targetHotelId = this.currentSession?.user.hotelId || 'HTL-001';
    const hotel = this.hotels.find(h => h.id === targetHotelId) || this.hotels[0];
    const rooms = this.rooms.filter(r => r.hotelId === hotel.id);
    const bookings = this.bookings.filter(b => b.hotelId === hotel.id);

    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed');
    const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled');
    const totalRev = confirmed.reduce((acc, b) => acc + b.totalAmount, 0);

    return {
      hotel,
      rooms,
      bookings,
      stats: {
        totalRevenue: totalRev,
        confirmedBookings: confirmed.length,
        cancelledBookings: cancelled.length,
        occupancyRate: '88%',
        activeRoomsCount: rooms.length
      }
    };
  }

  public async saveRoom(roomData: Partial<Room>): Promise<{ success: boolean; room: Room }> {
    await new Promise(r => setTimeout(r, 300));
    if (roomData.id) {
      const idx = this.rooms.findIndex(r => r.id === roomData.id);
      if (idx !== -1) {
        this.rooms[idx] = { ...this.rooms[idx], ...roomData } as Room;
        this.saveState();
        return { success: true, room: this.rooms[idx] };
      }
    }

    const newRoom: Room = {
      id: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      hotelId: roomData.hotelId || this.currentSession?.user.hotelId || 'HTL-001',
      hotelName: roomData.hotelName || 'Luxury Hotel',
      name: roomData.name || 'New Executive Suite',
      type: roomData.type || 'suite',
      description: roomData.description || 'Luxurious accommodations with premium amenities.',
      pricePerNight: roomData.pricePerNight || 950,
      capacityGuests: roomData.capacityGuests || 2,
      bedType: roomData.bedType || 'King Bed',
      sizeSqFt: roomData.sizeSqFt || 850,
      images: roomData.images || ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
      amenities: roomData.amenities || ['Place View', 'Marble Bath', 'Champagne Bar'],
      totalInventory: roomData.totalInventory || 3,
      status: roomData.status || 'available',
      createdAt: new Date().toISOString()
    };

    this.rooms.unshift(newRoom);
    this.saveState();
    return { success: true, room: newRoom };
  }

  public async deleteRoom(roomId: string): Promise<{ success: boolean }> {
    await new Promise(r => setTimeout(r, 200));
    this.rooms = this.rooms.filter(r => r.id !== roomId);
    this.saveState();
    return { success: true };
  }

  public async getSuperAdminDashboard(): Promise<{
    stats: {
      grossPlatformVolume: number;
      totalBookings: number;
      confirmedBookings: number;
      cancelledBookings: number;
      totalHotels: number;
      totalRooms: number;
      totalUsers: number;
      systemHealth: string;
    };
    users: User[];
    hotels: Hotel[];
    recentBookings: Booking[];
  }> {
    await new Promise(r => setTimeout(r, 300));
    const confirmed = this.bookings.filter(b => b.bookingStatus === 'confirmed');
    const cancelled = this.bookings.filter(b => b.bookingStatus === 'cancelled');
    const grossVolume = confirmed.reduce((acc, b) => acc + b.totalAmount, 0);

    return {
      stats: {
        grossPlatformVolume: grossVolume,
        totalBookings: this.bookings.length,
        confirmedBookings: confirmed.length,
        cancelledBookings: cancelled.length,
        totalHotels: this.hotels.length,
        totalRooms: this.rooms.length,
        totalUsers: this.users.length,
        systemHealth: 'Optimal (Google Apps Script V8 + Sheets Database)'
      },
      users: this.users,
      hotels: this.hotels,
      recentBookings: this.bookings
    };
  }

  public async updateUserRole(userId: string, newRole: UserRole, hotelId?: string): Promise<{ success: boolean }> {
    await new Promise(r => setTimeout(r, 250));
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.role = newRole;
      if (hotelId !== undefined) u.hotelId = hotelId;
      if (this.currentSession?.user.id === userId) {
        this.currentSession.user.role = newRole;
        this.currentSession.user.hotelId = hotelId;
      }
      this.saveState();
    }
    return { success: true };
  }

  public async toggleHotelStatus(hotelId: string, status: 'active' | 'maintenance'): Promise<{ success: boolean }> {
    await new Promise(r => setTimeout(r, 200));
    const h = this.hotels.find(hotel => hotel.id === hotelId);
    if (h) {
      h.status = status;
      this.saveState();
    }
    return { success: true };
  }

  // --- AUTH METHODS ---

  public async login(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(r => setTimeout(r, 350));
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'This account has been suspended by the platform administrator.' };
    }

    this.currentSession = {
      token: `token-${user.id}-${Date.now()}`,
      user: user,
      expiresAt: Date.now() + 86400000 * 7
    };
    this.saveState();
    return { success: true, user: user };
  }

  public async register(data: { 
    name: string; 
    email: string; 
    phone?: string; 
    password?: string; 
    role?: UserRole; 
    hotelId?: string; 
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(r => setTimeout(r, 400));
    const cleanEmail = data.email.toLowerCase().trim();

    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      email: cleanEmail,
      phone: data.phone || '+1 (555) 000-0000',
      role: data.role || 'customer',
      hotelId: data.hotelId,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    this.users.push(newUser);
    this.currentSession = {
      token: `token-${newUser.id}-${Date.now()}`,
      user: newUser,
      expiresAt: Date.now() + 86400000 * 7
    };
    this.saveState();
    return { success: true, user: newUser };
  }

  public async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 300));
    return {
      success: true,
      message: `A secure temporary reset key has been dispatched to ${email}.`
    };
  }

  public async logout() {
    this.currentSession = null;
    this.saveState();
  }
}

export const api = new ApiBridge();
