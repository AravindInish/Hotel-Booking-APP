import { Hotel, Room, Review, User, Booking } from '../types';

export const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'HTL-001',
    name: 'Le Palais de Lumière',
    tagline: 'Haute Parisian Elegance Overlooking Place Vendôme',
    description: 'Nestled in the prestigious 1st arrondissement, Le Palais de Lumière marries 18th-century French neoclassical grandeur with bespoke contemporary luxury. Indulge in triple-Michelin-starred gastronomy, private Guerlain spa sanctuaries, and personal 24/7 butler service.',
    city: 'Paris',
    country: 'France',
    address: '15 Place Vendôme, 75001 Paris',
    stars: 5,
    rating: 4.96,
    reviewCount: 342,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Michelin 3-Star Dining', 'Private Guerlain Spa', '24/7 Butler Service', 'Heated Indoor Pool', 'Chauffeured Rolls Royce', 'Private Wine Cellar', 'Valet Parking', 'High-Speed Fiber'],
    priceFrom: 850,
    status: 'active',
    featured: true,
    contactEmail: 'concierge.paris@aihotels.com',
    contactPhone: '+33 1 43 16 30 30',
    latitude: 48.8675,
    longitude: 2.3294,
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'HTL-002',
    name: 'Aman Kyoto Sanctuary',
    tagline: 'Secret Forest Pavilion in Ancient Sacred Capital',
    description: 'Set in a hidden 80-acre valley of moss gardens and towering cedar forests, Aman Kyoto offers an authentic sanctuary where minimalist Japanese architecture meets sacred natural hot springs (Onsen) and private tea ceremony masters.',
    city: 'Kyoto',
    country: 'Japan',
    address: '1 Okitayama Washimine-cho, Kita-ku, Kyoto',
    stars: 5,
    rating: 4.98,
    reviewCount: 289,
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Natural Onsen Baths', 'Private Tea Pavilion', 'Kaiseki Master Dining', 'Forest Meditation Garden', 'Bespoke Kyoto Tours', 'Zen Yoga Studio', 'Helicopter Transfer'],
    priceFrom: 1150,
    status: 'active',
    featured: true,
    contactEmail: 'kyoto.concierge@aihotels.com',
    contactPhone: '+81 75 496 1333',
    latitude: 35.0489,
    longitude: 135.7335,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'HTL-003',
    name: 'Villa Bellissima Cliffside',
    tagline: 'Amalfi Coast Terraced Mediterranean Palace',
    description: 'Perched dramatically upon the cliff face above the azure Tyrrhenian Sea, Villa Bellissima features private Riva yacht excursions, infinity saltwater pools carved into rock, and fragrance-filled organic lemon groves.',
    city: 'Positano',
    country: 'Italy',
    address: 'Via Cristoforo Colombo 30, 84017 Positano',
    stars: 5,
    rating: 4.93,
    reviewCount: 415,
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Cliffside Saltwater Pool', 'Private Riva Yacht Access', 'Sunset Terrace Bar', 'Helipad', 'Organic Citrus Garden', 'Sommelier Tastings', 'Private Beach Cove'],
    priceFrom: 980,
    status: 'active',
    featured: true,
    contactEmail: 'positano@aihotels.com',
    contactPhone: '+39 089 875 066',
    latitude: 40.6281,
    longitude: 14.4850,
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'HTL-004',
    name: 'The Royal Mirage Pinnacle',
    tagline: 'Ultra-Luxury Arabian Gulf Haven & Sky Suites',
    description: 'An architectural wonder on the Arabian Gulf coastline with private white-sand beach cabanas, 24-karat gold gilded royal suites, private sky infinity pools, and panoramic views of Dubai marina skyline.',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: 'King Salman Bin Abdulaziz Al Saud St, Dubai Marina',
    stars: 5,
    rating: 4.95,
    reviewCount: 520,
    images: [
      'https://images.unsplash.com/photo-1512958789358-4dac569c6f7b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private White Sand Beach', 'Helipad Service', 'Caviar & Champagne Bar', 'World-Class Thalasso Spa', 'Supercar Valet', 'Marina Berth', 'Sub-Zero Cryo Chamber'],
    priceFrom: 1350,
    status: 'active',
    featured: true,
    contactEmail: 'dubai.royal@aihotels.com',
    contactPhone: '+971 4 399 9999',
    latitude: 25.0934,
    longitude: 55.1500,
    createdAt: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'HTL-005',
    name: 'Kandolhu Coral Atoll Villas',
    tagline: 'Overwater Lagoon Retreat with Private House Reef',
    description: 'A secluded private island paradise in the North Ari Atoll. Experience glass-floor overwater bungalows, direct turquoise ocean stairs, sunset plunge pools, and private dining on uninhabited sandbanks.',
    city: 'North Ari Atoll',
    country: 'Maldives',
    address: 'Universal Resorts, Kandolhu Island',
    stars: 5,
    rating: 4.99,
    reviewCount: 198,
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Overwater Glass Floor', 'Private Sunset Plunge Pool', 'Direct Coral Reef Access', 'Seaplane Transfer', 'Private Sandbank Dining', 'Diving Center'],
    priceFrom: 1600,
    status: 'active',
    featured: true,
    contactEmail: 'maldives.res@aihotels.com',
    contactPhone: '+960 668 0764',
    latitude: 3.9984,
    longitude: 72.8711,
    createdAt: '2026-02-14T00:00:00.000Z'
  },
  {
    id: 'HTL-006',
    name: 'The St. Moritz Alpine Lodge',
    tagline: 'Ski-in Ski-out Swiss Chalet Palace & Thermal Spas',
    description: 'Surrounded by snow-capped Engadin alpine peaks, this high-altitude haven offers direct ski-in/ski-out access, cedar-scented wood burning fireplaces, heated outdoor alpine thermal pools, and fondue degustations.',
    city: 'St. Moritz',
    country: 'Switzerland',
    address: 'Via Serlas 27, 7500 St. Moritz',
    stars: 5,
    rating: 4.94,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517840905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Direct Ski-in / Ski-out', 'Outdoor Alpine Thermal Pool', 'Private Ski Valet', 'Swiss Fondue Atelier', 'Whisky & Cigar Lounge', 'Indoor Tennis Court'],
    priceFrom: 1200,
    status: 'active',
    featured: false,
    contactEmail: 'stmoritz@aihotels.com',
    contactPhone: '+41 81 837 10 00',
    latitude: 46.4908,
    longitude: 9.8355,
    createdAt: '2026-02-18T00:00:00.000Z'
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'RM-001',
    hotelId: 'HTL-001',
    hotelName: 'Le Palais de Lumière',
    name: 'Vendôme Prestige King Suite',
    type: 'suite',
    description: 'Lavish 950 sq ft suite featuring custom 18th-century French moulding, a private marble fireplace, balcony with direct views over Place Vendôme, and complimentary Hermès bath rituals.',
    pricePerNight: 850,
    capacityGuests: 2,
    bedType: 'King Luxury Pillowtop',
    sizeSqFt: 950,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Place Vendôme View', 'Marble Soaking Tub', 'Hermès Toiletries', 'Complimentary Champagne & Bar', 'Nespresso Atelier', '24h Butler'],
    totalInventory: 5,
    status: 'available',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'RM-002',
    hotelId: 'HTL-001',
    hotelName: 'Le Palais de Lumière',
    name: 'The Imperial Penthouse & Rooftop Terrace',
    type: 'penthouse',
    description: 'The crowning jewel spanning 2,200 sq ft across the top floor. Features panoramic views of the Eiffel Tower, private rooftop jacuzzi terrace, formal dining room for eight, and private elevator.',
    pricePerNight: 2400,
    capacityGuests: 4,
    bedType: '2 Master King Beds',
    sizeSqFt: 2200,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Panoramic Eiffel Tower Views', 'Private Heated Jacuzzi', 'Dedicated Master Butler', 'Private Direct Elevator', 'Vintage Dom Pérignon Welcome', 'Chauffeured Airport Transfer'],
    totalInventory: 2,
    status: 'available',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'RM-003',
    hotelId: 'HTL-002',
    hotelName: 'Aman Kyoto Sanctuary',
    name: 'Washimine Cedar Forest Pavilion',
    type: 'suite',
    description: 'Traditional tatami flooring, floor-to-ceiling glass pavilions framing the moss forest, natural hinoki cypress onsen bathtub with mineral spring water, and handmade Kyoto tea set.',
    pricePerNight: 1150,
    capacityGuests: 2,
    bedType: 'Custom Japanese King',
    sizeSqFt: 1100,
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Forest Moss View', 'Hinoki Cedar Onsen Tub', 'Matcha Ceremony Bar', 'Organic Cotton Yukata', 'Daily Kaiseki Breakfast'],
    totalInventory: 4,
    status: 'available',
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'RM-004',
    hotelId: 'HTL-003',
    hotelName: 'Villa Bellissima Cliffside',
    name: 'Azure Sea Panorama Clifftop Villa',
    type: 'villa',
    description: 'Private clifftop residence featuring cascading bougainvillea, private infinity dip pool, outdoor dining terrace overlooking Positano bay, and handcrafted Vietri ceramic floors.',
    pricePerNight: 1450,
    capacityGuests: 3,
    bedType: 'King Bed + Daybed',
    sizeSqFt: 1400,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Dip Pool', 'Panoramic Positano Sea View', 'Terrace Solarium', 'Limoncello Bar', 'Private Sunset Boat Charter'],
    totalInventory: 3,
    status: 'available',
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'RM-005',
    hotelId: 'HTL-004',
    hotelName: 'The Royal Mirage Pinnacle',
    name: 'Sky Penthouse with Private Infinity Pool',
    type: 'penthouse',
    description: 'Spectacular duplex perched on the 55th floor featuring double-height glass ceilings, private heated cantilevered pool, 24K gold accents, and 360-degree views of Palm Jumeirah.',
    pricePerNight: 2100,
    capacityGuests: 4,
    bedType: '2 King Luxury Suites',
    sizeSqFt: 2600,
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Private Cantilevered Infinity Pool', 'Palm Jumeirah Views', 'Private Chef on Request', 'Aston Martin Transfer', 'Caviar Service'],
    totalInventory: 2,
    status: 'available',
    createdAt: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'RM-006',
    hotelId: 'HTL-005',
    hotelName: 'Kandolhu Coral Atoll Villas',
    name: 'Sunset Ocean Pool Water Villa',
    type: 'villa',
    description: 'Suspended over turquoise waters with direct lagoon reef access, glass floor salon, outdoor bathroom, and an infinity plunge pool aligned with the Maldivian sunset.',
    pricePerNight: 1850,
    capacityGuests: 2,
    bedType: 'King Ocean View Bed',
    sizeSqFt: 1600,
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Overwater Infinity Pool', 'Glass Floor Viewing Panel', 'Direct Reef Lagoon Stairs', 'Seaplane Lounge Access', 'Unlimited Scuba Dives'],
    totalInventory: 6,
    status: 'available',
    createdAt: '2026-02-14T00:00:00.000Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    hotelId: 'HTL-001',
    userId: 'USR-CU-001',
    userName: 'Lady Sophia Montgomery',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Unrivaled Parisian perfection & flawless butler attention',
    comment: 'From the chilled vintage champagne awaiting us in the Vendôme suite to the bespoke Guerlain spa session, every single second was sheer majesty. The concierge arranged private after-hours access to the Louvre!',
    stayDate: 'June 2026',
    createdAt: '2026-06-18T14:20:00.000Z',
    status: 'published'
  },
  {
    id: 'REV-002',
    hotelId: 'HTL-002',
    userId: 'USR-CU-002',
    userName: 'Lord Arthur Sterling',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Transcendent serenity in ancient cedar woods',
    comment: 'The morning mist over the moss gardens paired with the natural hinoki cypress onsen baths restored mind and body. The 10-course Kaiseki dinner by Master Chef Tanaka was a culinary revelation.',
    stayDate: 'July 2026',
    createdAt: '2026-07-22T09:15:00.000Z',
    status: 'published'
  },
  {
    id: 'REV-003',
    hotelId: 'HTL-003',
    userId: 'USR-CU-003',
    userName: 'Camilla & David Thorne',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'The ultimate Amalfi coast dreamscape',
    comment: 'Sitting on the private cliffside terrace watching the sunset while sipping ice-cold limoncello is unforgettable. The private yacht day trip to Capri was expertly curated.',
    stayDate: 'August 2026',
    createdAt: '2026-08-10T18:40:00.000Z',
    status: 'published'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-SA-001',
    name: 'Alexander Vance',
    email: 'admin@aihotels.com',
    role: 'super_admin',
    phone: '+1 (555) 019-2831',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'USR-HA-001',
    name: 'Elena Rostova',
    email: 'manager.paris@aihotels.com',
    role: 'hotel_admin',
    hotelId: 'HTL-001',
    phone: '+33 1 43 16 30 30',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-05T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'USR-CU-001',
    name: 'Sophia Montgomery',
    email: 'guest@example.com',
    role: 'customer',
    phone: '+1 (555) 982-1144',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-01T00:00:00.000Z',
    status: 'active'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'AIH-2026-7841',
    userId: 'USR-CU-001',
    userName: 'Sophia Montgomery',
    userEmail: 'guest@example.com',
    userPhone: '+1 (555) 982-1144',
    hotelId: 'HTL-001',
    hotelName: 'Le Palais de Lumière',
    roomId: 'RM-001',
    roomName: 'Vendôme Prestige King Suite',
    roomType: 'suite',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-19',
    nights: 4,
    guests: 2,
    pricePerNight: 850,
    subtotal: 3400,
    taxAmount: 408,
    resortFee: 50,
    totalAmount: 3858,
    paymentStatus: 'paid',
    paymentMethod: 'American Express Centurion (•••• 8821)',
    bookingStatus: 'confirmed',
    specialRequests: 'High floor preferred. Please prepare chilled Dom Pérignon upon arrival.',
    createdAt: '2026-08-15T11:24:00.000Z'
  }
];
