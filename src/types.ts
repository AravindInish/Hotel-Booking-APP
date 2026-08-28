export type UserRole = 'customer' | 'hotel_admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  hotelId?: string; // If hotel_admin, links to their managed hotel
  avatarUrl?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface Hotel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  address: string;
  stars: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  priceFrom: number;
  status: 'active' | 'maintenance';
  featured: boolean;
  contactEmail: string;
  contactPhone: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export type RoomType = 'deluxe' | 'suite' | 'penthouse' | 'presidential' | 'villa';

export interface Room {
  id: string;
  hotelId: string;
  hotelName: string;
  name: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  capacityGuests: number;
  bedType: string;
  sizeSqFt: number;
  images: string[];
  amenities: string[];
  totalInventory: number;
  status: 'available' | 'maintenance';
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'refunded';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string; // e.g. AIH-2026-8942
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  roomType: RoomType;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  pricePerNight: number;
  subtotal: number;
  taxAmount: number;
  resortFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  bookingStatus: BookingStatus;
  specialRequests?: string;
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  transactionRef: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
}

export interface Review {
  id: string;
  hotelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  stayDate: string;
  createdAt: string;
  status: 'published' | 'flagged';
}

export interface SearchFilters {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  minPrice: number;
  maxPrice: number;
  stars: number[];
  amenities: string[];
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating';
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}
