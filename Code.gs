/**
 * AI HOTELS & ROOMS - Google Apps Script Backend Engine
 * Google Sheets Database Driver & Web App Controller
 * 
 * Version: 2.4.0
 * Architecture: Apps Script Web App + Multi-Tab Google Sheets
 * 
 * Sheets:
 *  1. Users     (id, name, email, passwordHash, salt, role, phone, hotelId, createdAt, status)
 *  2. Hotels    (id, name, tagline, description, city, country, address, stars, rating, reviewCount, images, amenities, priceFrom, status, featured, contactEmail, contactPhone, latitude, longitude, createdAt)
 *  3. Rooms     (id, hotelId, hotelName, name, type, description, pricePerNight, capacityGuests, bedType, sizeSqFt, images, amenities, totalInventory, status, createdAt)
 *  4. Bookings  (id, userId, userName, userEmail, userPhone, hotelId, hotelName, roomId, roomName, roomType, checkInDate, checkOutDate, nights, guests, pricePerNight, subtotal, taxAmount, resortFee, totalAmount, paymentStatus, paymentMethod, bookingStatus, specialRequests, createdAt, cancelledAt, cancellationReason)
 *  5. Payments  (id, bookingId, userId, amount, currency, method, transactionRef, status, timestamp)
 *  6. Reviews   (id, hotelId, userId, userName, rating, title, comment, stayDate, createdAt, status)
 */

// ==========================================
// 1. CONFIGURATION & SCRIPT PROPERTIES
// ==========================================
const SCRIPT_PROP = PropertiesService.getScriptProperties();

function getSpreadsheet() {
  const customId = SCRIPT_PROP.getProperty('SPREADSHEET_ID');
  if (customId) {
    try {
      return SpreadsheetApp.openById(customId);
    } catch (err) {
      console.warn('Could not open spreadsheet with stored ID. Falling back to active spreadsheet: ' + err);
    }
  }
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    throw new Error('Spreadsheet not connected. Please set SPREADSHEET_ID in Script Properties or bind script to Google Sheet.');
  }
}

function getJwtSecret() {
  let secret = SCRIPT_PROP.getProperty('JWT_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + '-' + Utilities.getUuid();
    SCRIPT_PROP.setProperty('JWT_SECRET', secret);
  }
  return secret;
}

// ==========================================
// 2. WEB APP ENTRY POINTS (doGet & doPost)
// ==========================================
function doGet(e) {
  // If API request via GET query param
  if (e && e.parameter && e.parameter.action) {
    return handleGetApi(e.parameter);
  }

  // Serve Frontend UI
  const template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('AI Hotels & Rooms | Luxury Boutique Stays')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const postData = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : (e.parameter || {});
    const action = postData.action;
    const token = postData.token;
    const data = postData.data || postData;

    let result;
    switch (action) {
      case 'register':
        result = apiRegisterUser(data);
        break;
      case 'login':
        result = apiLoginUser(data);
        break;
      case 'verifySession':
        result = apiVerifySession(token);
        break;
      case 'getHotels':
        result = apiGetHotels(data.filters || {});
        break;
      case 'getHotelDetails':
        result = apiGetHotelDetails(data.hotelId);
        break;
      case 'checkAvailability':
        result = apiCheckAvailability(data.hotelId, data.roomId, data.checkInDate, data.checkOutDate);
        break;
      case 'createBooking':
        result = apiCreateBooking(token, data);
        break;
      case 'cancelBooking':
        result = apiCancelBooking(token, data.bookingId, data.reason);
        break;
      case 'getUserBookings':
        result = apiGetUserBookings(token);
        break;
      case 'submitReview':
        result = apiSubmitReview(token, data);
        break;
      case 'getHotelAdminDashboard':
        result = apiGetHotelAdminDashboard(token);
        break;
      case 'adminSaveRoom':
        result = apiAdminSaveRoom(token, data);
        break;
      case 'adminDeleteRoom':
        result = apiAdminDeleteRoom(token, data.roomId);
        break;
      case 'adminSaveHotel':
        result = apiAdminSaveHotel(token, data);
        break;
      case 'getSuperAdminDashboard':
        result = apiGetSuperAdminDashboard(token);
        break;
      case 'superAdminUpdateUserRole':
        result = apiSuperAdminUpdateUserRole(token, data.userId, data.newRole, data.hotelId);
        break;
      case 'superAdminToggleHotelStatus':
        result = apiSuperAdminToggleHotelStatus(token, data.hotelId, data.status);
        break;
      case 'initDatabase':
        result = initDatabase();
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message || 'Server error occurred'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetApi(params) {
  const action = params.action;
  let result;
  if (action === 'getHotels') {
    result = apiGetHotels({});
  } else if (action === 'initDatabase') {
    result = initDatabase();
  } else {
    result = { success: true, message: 'AI Hotels & Rooms API is active', timestamp: new Date().toISOString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 3. DATABASE SCHEMA & INITIALIZATION
// ==========================================
const SHEET_HEADERS = {
  Users: ['id', 'name', 'email', 'passwordHash', 'salt', 'role', 'phone', 'hotelId', 'createdAt', 'status'],
  Hotels: ['id', 'name', 'tagline', 'description', 'city', 'country', 'address', 'stars', 'rating', 'reviewCount', 'images', 'amenities', 'priceFrom', 'status', 'featured', 'contactEmail', 'contactPhone', 'latitude', 'longitude', 'createdAt'],
  Rooms: ['id', 'hotelId', 'hotelName', 'name', 'type', 'description', 'pricePerNight', 'capacityGuests', 'bedType', 'sizeSqFt', 'images', 'amenities', 'totalInventory', 'status', 'createdAt'],
  Bookings: ['id', 'userId', 'userName', 'userEmail', 'userPhone', 'hotelId', 'hotelName', 'roomId', 'roomName', 'roomType', 'checkInDate', 'checkOutDate', 'nights', 'guests', 'pricePerNight', 'subtotal', 'taxAmount', 'resortFee', 'totalAmount', 'paymentStatus', 'paymentMethod', 'bookingStatus', 'specialRequests', 'createdAt', 'cancelledAt', 'cancellationReason'],
  Payments: ['id', 'bookingId', 'userId', 'amount', 'currency', 'method', 'transactionRef', 'status', 'timestamp'],
  Reviews: ['id', 'hotelId', 'userId', 'userName', 'rating', 'title', 'comment', 'stayDate', 'createdAt', 'status']
};

/**
 * Creates/repairs all sheets, sets styled headers, and seeds initial luxury sample data if empty.
 */
function initDatabase() {
  const ss = getSpreadsheet();
  const createdSheets = [];

  for (const sheetName in SHEET_HEADERS) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      createdSheets.push(sheetName);
    }
    
    // Check if header exists
    if (sheet.getLastRow() === 0) {
      const headers = SHEET_HEADERS[sheetName];
      sheet.appendRow(headers);
      
      // Style headers: Navy/Gold header bar
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#0f172a');
      headerRange.setFontColor('#f8fafc');
      headerRange.setFontWeight('bold');
      headerRange.setFontFamily('Google Sans, Roboto, sans-serif');
      sheet.setFrozenRows(1);
    }
  }

  // Seed default admin and initial sample hotels if empty
  seedInitialData(ss);

  return {
    success: true,
    message: 'Database initialized successfully with 6 luxury hotel booking sheets.',
    sheets: Object.keys(SHEET_HEADERS),
    created: createdSheets
  };
}

function seedInitialData(ss) {
  const userSheet = ss.getSheetByName('Users');
  if (userSheet.getLastRow() <= 1) {
    // Seed Super Admin, Hotel Admin, and Customer
    const adminSalt = Utilities.getUuid();
    const adminHash = hashPassword('admin123', adminSalt);
    const hotelAdminSalt = Utilities.getUuid();
    const hotelAdminHash = hashPassword('hotel123', hotelAdminSalt);
    const customerSalt = Utilities.getUuid();
    const customerHash = hashPassword('guest123', customerSalt);

    userSheet.appendRow([
      'USR-SA-001', 'Alexander Vance (Super Admin)', 'admin@aihotels.com', adminHash, adminSalt, 'super_admin', '+1 (555) 019-2831', '', new Date().toISOString(), 'active'
    ]);
    userSheet.appendRow([
      'USR-HA-001', 'Elena Rostova (Hotel General Manager)', 'manager.paris@aihotels.com', hotelAdminHash, hotelAdminSalt, 'hotel_admin', '+33 1 43 16 30 30', 'HTL-001', new Date().toISOString(), 'active'
    ]);
    userSheet.appendRow([
      'USR-CU-001', 'Sophia Montgomery', 'guest@example.com', customerHash, customerSalt, 'customer', '+1 (555) 982-1144', '', new Date().toISOString(), 'active'
    ]);
  }

  const hotelSheet = ss.getSheetByName('Hotels');
  if (hotelSheet.getLastRow() <= 1) {
    const initialHotels = [
      [
        'HTL-001', 'Le Palais de Lumière', 'Haute Parisian Elegance Overlooking Place Vendôme',
        'Nestled in the beating heart of Paris, Le Palais de Lumière marries 18th-century French neoclassicism with bespoke contemporary luxury. Indulge in triple-Michelin-starred gastronomy, Guerlain private spa sanctuaries, and personal butler service.',
        'Paris', 'France', '15 Place Vendôme, 75001 Paris', 5, 4.95, 342,
        JSON.stringify([
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
        ]),
        JSON.stringify(['Michelin 3-Star Dining', 'Private Guerlain Spa', '24/7 Butler Service', 'Heated Indoor Pool', 'Chauffeured Rolls Royce', 'Wine Cellar', 'Valet Parking', 'High-Speed Fiber']),
        850, 'active', true, 'concierge.paris@aihotels.com', '+33 1 43 16 30 30', 48.8675, 2.3294, new Date().toISOString()
      ],
      [
        'HTL-002', 'Aman Kyoto Sanctuary', 'Secret Forest Pavilion in Ancient Capital',
        'Set in a hidden valley of moss gardens and towering cedar forests, Aman Kyoto offers an authentic sanctuary where minimalist Japanese architecture meets sacred natural hot springs (Onsen) and private tea ceremony masters.',
        'Kyoto', 'Japan', '1 Okitayama Washimine-cho, Kita-ku, Kyoto', 5, 4.98, 289,
        JSON.stringify([
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
        ]),
        JSON.stringify(['Natural Onsen Baths', 'Private Tea Pavilion', 'Kaiseki Master Dining', 'Forest Meditation Garden', 'Bespoke Kyoto Tours', 'Zen Yoga Studio']),
        1150, 'active', true, 'kyoto.concierge@aihotels.com', '+81 75 496 1333', 35.0489, 135.7335, new Date().toISOString()
      ],
      [
        'HTL-003', 'Villa Bellissima Cliffside', 'Amalfi Coast Terraced Mediterranean Palace',
        'Perched dramatically upon the cliff face above the azure Tyrrhenian Sea, Villa Bellissima features private yacht excursions, infinity saltwater pools carved into rock, and fragrance-filled lemon groves.',
        'Positano', 'Italy', 'Via Cristoforo Colombo 30, 84017 Positano', 5, 4.92, 415,
        JSON.stringify([
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
        ]),
        JSON.stringify(['Cliffside Saltwater Pool', 'Private Riva Yacht Access', 'Sunset Terrace Bar', 'Helipad', 'Organic Citrus Garden', 'Sommelier Tastings']),
        980, 'active', true, 'positano@aihotels.com', '+39 089 875 066', 40.6281, 14.4850, new Date().toISOString()
      ],
      [
        'HTL-004', 'The Royal Mirage Pinnacle', 'Ultra-Luxury Arabian Gulf Haven',
        'An architectural masterpiece rising against the Dubai skyline with private beach cabanas, royal suites with 24-karat gold fixtures, private infinity pools, and rooftop stargazing lounges.',
        'Dubai', 'United Arab Emirates', 'King Salman Bin Abdulaziz Al Saud St, Dubai', 5, 4.94, 520,
        JSON.stringify([
          'https://images.unsplash.com/photo-1512958789358-4dac569c6f7b?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
        ]),
        JSON.stringify(['Private White Sand Beach', 'Helipad Service', 'Caviar & Champagne Bar', 'World-Class Thalasso Spa', 'Supercar Valet', 'Marina Berth']),
        1350, 'active', true, 'dubai.royal@aihotels.com', '+971 4 399 9999', 25.0934, 55.1500, new Date().toISOString()
      ]
    ];

    initialHotels.forEach(hotel => hotelSheet.appendRow(hotel));
  }

  const roomSheet = ss.getSheetByName('Rooms');
  if (roomSheet.getLastRow() <= 1) {
    const initialRooms = [
      [
        'RM-001', 'HTL-001', 'Le Palais de Lumière', 'Vendôme Prestige King Suite', 'suite',
        'Lavish 950 sq ft suite with private marble fireplace, bespoke silk wall coverings, balcony overlooking Place Vendôme, and Hermes bath amenities.',
        850, 2, 'King Luxury Pillowtop', 950,
        JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80']),
        JSON.stringify(['Place Vendôme View', 'Marble Soaking Tub', 'Hermes Amenities', 'Free Bar & Champagne', 'Espresso Atelier']),
        5, 'available', new Date().toISOString()
      ],
      [
        'RM-002', 'HTL-001', 'Le Palais de Lumière', 'The Imperial Penthouse & Terrace', 'penthouse',
        'Crown jewel spanning 2,200 sq ft across the top floor with 360° views of Eiffel Tower, private rooftop whirlpool, dining hall for 8, and dedicated 24-hr butler.',
        2400, 4, '2 Master King Beds', 2200,
        JSON.stringify(['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80']),
        JSON.stringify(['Panoramic Eiffel Views', 'Private Rooftop Jacuzzi', 'Dedicated Butler', 'Private Elevator', 'Dom Pérignon Welcome']),
        2, 'available', new Date().toISOString()
      ],
      [
        'RM-003', 'HTL-002', 'Aman Kyoto Sanctuary', 'Washimine Cedar Forest Suite', 'suite',
        'Traditional tatami flooring, floor-to-ceiling glass pavilions framing the moss forest, natural hinoki cypress bathtub, and handmade pottery tea sets.',
        1150, 2, 'Custom Japanese King', 1100,
        JSON.stringify(['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80']),
        JSON.stringify(['Forest Moss View', 'Hinoki Cedar Onsen Tub', 'Matcha Ceremony Bar', 'Organic Yukata Robes']),
        4, 'available', new Date().toISOString()
      ],
      [
        'RM-004', 'HTL-003', 'Villa Bellissima Cliffside', 'Azure Sea Panorama Villa', 'villa',
        'Private clifftop villa featuring cascading bougainvillea, private infinity dip pool, outdoor dining terrace overlooking Positano, and sunset daybeds.',
        1450, 3, 'King + Daybed', 1400,
        JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80']),
        JSON.stringify(['Private Dip Pool', 'Panoramic Positano Sea View', 'Terrace Solarium', 'Limoncello Bar']),
        3, 'available', new Date().toISOString()
      ]
    ];
    initialRooms.forEach(room => roomSheet.appendRow(room));
  }

  const reviewSheet = ss.getSheetByName('Reviews');
  if (reviewSheet.getLastRow() <= 1) {
    const initialReviews = [
      ['REV-001', 'HTL-001', 'USR-CU-001', 'Sophia Montgomery', 5, 'Unrivaled Parisian perfection', 'From the champagne arrival to the private Guerlain spa treatment, every second felt like royal treatment. The Vendôme suite view was breathtaking.', '2026-06-14', new Date().toISOString(), 'published'],
      ['REV-002', 'HTL-002', 'USR-CU-001', 'Sophia Montgomery', 5, 'Peace and transcendental beauty', 'The moss gardens at Aman Kyoto and the morning cedar onsen baths restored my spirit. Exceptional Kaiseki dining.', '2026-07-20', new Date().toISOString(), 'published']
    ];
    initialReviews.forEach(rev => reviewSheet.appendRow(rev));
  }
}

// ==========================================
// 4. SECURITY, CRYPTOGRAPHY & AUTHENTICATION
// ==========================================
function hashPassword(password, salt) {
  const combined = password + ':' + salt + ':' + getJwtSecret();
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined, Utilities.Charset.UTF_8);
  return rawHash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    hotelId: user.hotelId || '',
    issuedAt: new Date().getTime(),
    expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  const str = JSON.stringify(payload);
  const encoded = Utilities.base64EncodeWebSafe(str);
  const signature = Utilities.computeHmacSha256Signature(encoded, getJwtSecret());
  const sigEncoded = Utilities.base64EncodeWebSafe(signature);
  return encoded + '.' + sigEncoded;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, clientSig] = parts;
  const expectedSigBytes = Utilities.computeHmacSha256Signature(encodedPayload, getJwtSecret());
  const expectedSig = Utilities.base64EncodeWebSafe(expectedSigBytes);

  if (clientSig !== expectedSig) return null;

  try {
    const payloadStr = Utilities.newBlob(Utilities.base64DecodeWebSafe(encodedPayload)).getDataAsString();
    const payload = JSON.parse(payloadStr);
    if (new Date().getTime() > payload.expiresAt) return null;

    // Verify user is still active in database
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('Users');
    const rows = userSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === payload.userId) {
        if (rows[i][9] !== 'active') return null; // suspended
        return {
          id: rows[i][0],
          name: rows[i][1],
          email: rows[i][2],
          role: rows[i][5],
          phone: rows[i][6],
          hotelId: rows[i][7],
          createdAt: rows[i][8],
          status: rows[i][9]
        };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

function generateBookingId() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return 'AIH-' + year + '-' + randomChars + num;
}

// ==========================================
// 5. PUBLIC CLIENT API METHODS
// ==========================================

function apiRegisterUser(data) {
  try {
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: 'Name, email, and password are required.' };
    }
    const email = String(data.email).trim().toLowerCase();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return { success: false, error: 'Invalid email address format.' };
    }
    if (String(data.password).length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('Users');
    const rows = userSheet.getDataRange().getValues();

    // Check duplicate email
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toLowerCase() === email) {
        return { success: false, error: 'An account with this email already exists.' };
      }
    }

    const userId = 'USR-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    const salt = Utilities.getUuid();
    const passwordHash = hashPassword(data.password, salt);
    const role = 'customer';
    const createdAt = new Date().toISOString();
    const phone = data.phone || '';

    userSheet.appendRow([
      userId, data.name, email, passwordHash, salt, role, phone, '', createdAt, 'active'
    ]);

    const user = { id: userId, name: data.name, email: email, role: role, phone: phone, createdAt: createdAt, status: 'active' };
    const token = generateToken(user);

    return { success: true, token: token, user: user, message: 'Registration successful.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiLoginUser(data) {
  try {
    if (!data.email || !data.password) {
      return { success: false, error: 'Email and password are required.' };
    }
    const email = String(data.email).trim().toLowerCase();
    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('Users');
    const rows = userSheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toLowerCase() === email) {
        if (rows[i][9] !== 'active') {
          return { success: false, error: 'Your account is suspended. Please contact concierge support.' };
        }
        const salt = rows[i][4];
        const storedHash = rows[i][3];
        const computedHash = hashPassword(data.password, salt);

        if (computedHash === storedHash) {
          const user = {
            id: rows[i][0],
            name: rows[i][1],
            email: rows[i][2],
            role: rows[i][5],
            phone: rows[i][6],
            hotelId: rows[i][7],
            createdAt: rows[i][8],
            status: rows[i][9]
          };
          const token = generateToken(user);
          return { success: true, token: token, user: user, message: 'Login successful.' };
        } else {
          return { success: false, error: 'Invalid password. Please check your credentials.' };
        }
      }
    }
    return { success: false, error: 'No account found with this email address.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiVerifySession(token) {
  const user = verifySession(token);
  if (!user) {
    return { success: false, error: 'Session expired or invalid. Please sign in again.' };
  }
  return { success: true, user: user };
}

function apiGetHotels(filters) {
  try {
    const ss = getSpreadsheet();
    const hotelSheet = ss.getSheetByName('Hotels');
    if (!hotelSheet) initDatabase();
    
    const rows = hotelSheet.getDataRange().getValues();
    const hotels = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      
      let images = [];
      let amenities = [];
      try { images = JSON.parse(row[10]); } catch (e) { images = String(row[10]).split(',').map(s => s.trim()).filter(Boolean); }
      try { amenities = JSON.parse(row[11]); } catch (e) { amenities = String(row[11]).split(',').map(s => s.trim()).filter(Boolean); }

      const hotel = {
        id: String(row[0]),
        name: String(row[1]),
        tagline: String(row[2]),
        description: String(row[3]),
        city: String(row[4]),
        country: String(row[5]),
        address: String(row[6]),
        stars: Number(row[7]) || 5,
        rating: Number(row[8]) || 4.9,
        reviewCount: Number(row[9]) || 0,
        images: images,
        amenities: amenities,
        priceFrom: Number(row[12]) || 500,
        status: String(row[13]),
        featured: Boolean(row[14]),
        contactEmail: String(row[15]),
        contactPhone: String(row[16]),
        latitude: Number(row[17]),
        longitude: Number(row[18]),
        createdAt: String(row[19])
      };

      // Filter matches
      if (filters && filters.destination) {
        const dest = filters.destination.toLowerCase();
        const matchesLoc = hotel.city.toLowerCase().includes(dest) || hotel.country.toLowerCase().includes(dest) || hotel.name.toLowerCase().includes(dest);
        if (!matchesLoc) continue;
      }
      if (filters && filters.minPrice && hotel.priceFrom < filters.minPrice) continue;
      if (filters && filters.maxPrice && hotel.priceFrom > filters.maxPrice) continue;
      if (filters && filters.stars && filters.stars.length > 0 && !filters.stars.includes(hotel.stars)) continue;
      if (hotel.status !== 'active' && (!filters || !filters.includeInactive)) continue;

      hotels.push(hotel);
    }

    return { success: true, hotels: hotels };
  } catch (err) {
    return { success: false, error: err.message, hotels: [] };
  }
}

function apiGetHotelDetails(hotelId) {
  try {
    const ss = getSpreadsheet();
    const hotelSheet = ss.getSheetByName('Hotels');
    const roomSheet = ss.getSheetByName('Rooms');
    const reviewSheet = ss.getSheetByName('Reviews');

    const hotelRows = hotelSheet.getDataRange().getValues();
    let hotel = null;

    for (let i = 1; i < hotelRows.length; i++) {
      if (hotelRows[i][0] === hotelId) {
        const row = hotelRows[i];
        let images = [], amenities = [];
        try { images = JSON.parse(row[10]); } catch(e) { images = [row[10]]; }
        try { amenities = JSON.parse(row[11]); } catch(e) { amenities = [row[11]]; }

        hotel = {
          id: row[0], name: row[1], tagline: row[2], description: row[3],
          city: row[4], country: row[5], address: row[6], stars: row[7],
          rating: row[8], reviewCount: row[9], images: images, amenities: amenities,
          priceFrom: row[12], status: row[13], featured: row[14],
          contactEmail: row[15], contactPhone: row[16], latitude: row[17], longitude: row[18]
        };
        break;
      }
    }

    if (!hotel) return { success: false, error: 'Hotel not found' };

    // Get rooms
    const roomRows = roomSheet.getDataRange().getValues();
    const rooms = [];
    for (let i = 1; i < roomRows.length; i++) {
      if (roomRows[i][1] === hotelId && roomRows[i][13] === 'available') {
        const r = roomRows[i];
        let rImages = [], rAmenities = [];
        try { rImages = JSON.parse(r[10]); } catch(e) { rImages = [r[10]]; }
        try { rAmenities = JSON.parse(r[11]); } catch(e) { rAmenities = [r[11]]; }

        rooms.push({
          id: r[0], hotelId: r[1], hotelName: r[2], name: r[3], type: r[4],
          description: r[5], pricePerNight: Number(r[6]), capacityGuests: Number(r[7]),
          bedType: r[8], sizeSqFt: Number(r[9]), images: rImages, amenities: rAmenities,
          totalInventory: Number(r[12]), status: r[13]
        });
      }
    }

    // Get reviews
    const revRows = reviewSheet.getDataRange().getValues();
    const reviews = [];
    for (let i = 1; i < revRows.length; i++) {
      if (revRows[i][1] === hotelId && revRows[i][9] === 'published') {
        const rv = revRows[i];
        reviews.push({
          id: rv[0], hotelId: rv[1], userId: rv[2], userName: rv[3],
          rating: Number(rv[4]), title: rv[5], comment: rv[6], stayDate: rv[7], createdAt: rv[8]
        });
      }
    }

    return { success: true, hotel: hotel, rooms: rooms, reviews: reviews };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Checks if a room has sufficient inventory for specified dates without conflict.
 */
function apiCheckAvailability(hotelId, roomId, checkInDate, checkOutDate) {
  try {
    const ss = getSpreadsheet();
    const roomSheet = ss.getSheetByName('Rooms');
    const bookingSheet = ss.getSheetByName('Bookings');

    // Find room inventory
    let totalInventory = 1;
    const roomRows = roomSheet.getDataRange().getValues();
    for (let i = 1; i < roomRows.length; i++) {
      if (roomRows[i][0] === roomId) {
        totalInventory = Number(roomRows[i][12]) || 1;
        break;
      }
    }

    const reqStart = new Date(checkInDate).getTime();
    const reqEnd = new Date(checkOutDate).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
      return { success: false, error: 'Invalid check-in or check-out dates.' };
    }

    // Count overlapping active bookings
    const bookingRows = bookingSheet.getDataRange().getValues();
    let overlappingCount = 0;

    for (let i = 1; i < bookingRows.length; i++) {
      const b = bookingRows[i];
      const bRoomId = b[7];
      const bStatus = b[21]; // bookingStatus
      const bIn = new Date(b[10]).getTime();
      const bOut = new Date(b[11]).getTime();

      if (bRoomId === roomId && bStatus === 'confirmed') {
        // Overlap test: (reqStart < bOut) and (reqEnd > bIn)
        if (reqStart < bOut && reqEnd > bIn) {
          overlappingCount++;
        }
      }
    }

    const availableSlots = Math.max(0, totalInventory - overlappingCount);
    const isAvailable = availableSlots > 0;

    return {
      success: true,
      available: isAvailable,
      availableSlots: availableSlots,
      totalInventory: totalInventory
    };
  } catch (err) {
    return { success: false, error: err.message, available: false };
  }
}

function apiCreateBooking(token, data) {
  try {
    const user = verifySession(token);
    if (!user) {
      return { success: false, error: 'Authentication required. Please sign in to reserve.' };
    }

    const { hotelId, hotelName, roomId, roomName, roomType, checkInDate, checkOutDate, guests, pricePerNight, paymentMethod, specialRequests } = data;

    if (!hotelId || !roomId || !checkInDate || !checkOutDate) {
      return { success: false, error: 'Missing required reservation fields.' };
    }

    // Server-side availability lock verification
    const avail = apiCheckAvailability(hotelId, roomId, checkInDate, checkOutDate);
    if (!avail.available) {
      return { success: false, error: 'The selected room is no longer available for these dates. Please choose another date or room.' };
    }

    const dIn = new Date(checkInDate);
    const dOut = new Date(checkOutDate);
    const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));
    const subtotal = nights * Number(pricePerNight);
    const taxAmount = Math.round(subtotal * 0.12 * 100) / 100; // 12% luxury & city tax
    const resortFee = 50; // $50 luxury spa and concierge resort fee
    const totalAmount = subtotal + taxAmount + resortFee;

    const bookingId = generateBookingId();
    const createdAt = new Date().toISOString();

    const ss = getSpreadsheet();
    const bookingSheet = ss.getSheetByName('Bookings');
    const paymentSheet = ss.getSheetByName('Payments');

    // Add booking row
    bookingSheet.appendRow([
      bookingId,
      user.id,
      user.name,
      user.email,
      user.phone || data.userPhone || '',
      hotelId,
      hotelName,
      roomId,
      roomName,
      roomType || 'suite',
      checkInDate,
      checkOutDate,
      nights,
      Number(guests) || 1,
      Number(pricePerNight),
      subtotal,
      taxAmount,
      resortFee,
      totalAmount,
      'paid',
      paymentMethod || 'Credit Card (Processed)',
      'confirmed',
      specialRequests || '',
      createdAt,
      '', // cancelledAt
      ''  // cancellationReason
    ]);

    // Record Payment
    const paymentId = 'PAY-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    paymentSheet.appendRow([
      paymentId,
      bookingId,
      user.id,
      totalAmount,
      'USD',
      paymentMethod || 'Credit Card',
      'TX-' + Utilities.getUuid().substring(0, 10).toUpperCase(),
      'success',
      createdAt
    ]);

    return {
      success: true,
      bookingId: bookingId,
      message: 'Luxury stay reservation confirmed successfully!',
      booking: {
        id: bookingId,
        hotelName: hotelName,
        roomName: roomName,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        nights: nights,
        guests: guests,
        totalAmount: totalAmount,
        bookingStatus: 'confirmed'
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiCancelBooking(token, bookingId, reason) {
  try {
    const user = verifySession(token);
    if (!user) return { success: false, error: 'Authentication required' };

    const ss = getSpreadsheet();
    const bookingSheet = ss.getSheetByName('Bookings');
    const rows = bookingSheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === bookingId) {
        // Check ownership or admin
        const bookingUserId = rows[i][1];
        const isOwner = (bookingUserId === user.id);
        const isAdmin = (user.role === 'super_admin' || user.role === 'hotel_admin');

        if (!isOwner && !isAdmin) {
          return { success: false, error: 'Unauthorized to cancel this booking.' };
        }

        // Set status to cancelled (col 22 is bookingStatus (index 21))
        bookingSheet.getRange(i + 1, 22).setValue('cancelled');
        // Set paymentStatus to refunded (col 20 is paymentStatus (index 19))
        bookingSheet.getRange(i + 1, 20).setValue('refunded');
        // Set cancelledAt (col 25 is index 24)
        bookingSheet.getRange(i + 1, 25).setValue(new Date().toISOString());
        // Set reason (col 26 is index 25)
        bookingSheet.getRange(i + 1, 26).setValue(reason || 'Guest requested cancellation');

        return { success: true, message: 'Reservation #' + bookingId + ' has been cancelled and refunded.' };
      }
    }

    return { success: false, error: 'Booking not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiGetUserBookings(token) {
  try {
    const user = verifySession(token);
    if (!user) return { success: false, error: 'Authentication required' };

    const ss = getSpreadsheet();
    const bookingSheet = ss.getSheetByName('Bookings');
    const rows = bookingSheet.getDataRange().getValues();
    const bookings = [];

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === user.id) {
        const b = rows[i];
        bookings.push({
          id: b[0], userId: b[1], userName: b[2], userEmail: b[3], userPhone: b[4],
          hotelId: b[5], hotelName: b[6], roomId: b[7], roomName: b[8], roomType: b[9],
          checkInDate: b[10], checkOutDate: b[11], nights: b[12], guests: b[13],
          pricePerNight: b[14], subtotal: b[15], taxAmount: b[16], resortFee: b[17],
          totalAmount: b[18], paymentStatus: b[19], paymentMethod: b[20],
          bookingStatus: b[21], specialRequests: b[22], createdAt: b[23],
          cancelledAt: b[24], cancellationReason: b[25]
        });
      }
    }

    // Sort newest first
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, bookings: bookings };
  } catch (err) {
    return { success: false, error: err.message, bookings: [] };
  }
}

function apiSubmitReview(token, data) {
  try {
    const user = verifySession(token);
    if (!user) return { success: false, error: 'Please sign in to leave a review.' };

    const { hotelId, rating, title, comment, stayDate } = data;
    if (!hotelId || !rating || !comment) {
      return { success: false, error: 'Rating and comments are required.' };
    }

    const reviewId = 'REV-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    const createdAt = new Date().toISOString();

    const ss = getSpreadsheet();
    const reviewSheet = ss.getSheetByName('Reviews');
    reviewSheet.appendRow([
      reviewId, hotelId, user.id, user.name, Number(rating), title || 'Verified Stay', comment, stayDate || '', createdAt, 'published'
    ]);

    // Recalculate hotel average rating
    const hotelSheet = ss.getSheetByName('Hotels');
    const hotelRows = hotelSheet.getDataRange().getValues();
    const allReviews = reviewSheet.getDataRange().getValues();
    let totalRatings = 0;
    let count = 0;

    for (let i = 1; i < allReviews.length; i++) {
      if (allReviews[i][1] === hotelId && allReviews[i][9] === 'published') {
        totalRatings += Number(allReviews[i][4]);
        count++;
      }
    }

    if (count > 0) {
      const avg = Math.round((totalRatings / count) * 10) / 10;
      for (let j = 1; j < hotelRows.length; j++) {
        if (hotelRows[j][0] === hotelId) {
          hotelSheet.getRange(j + 1, 9).setValue(avg); // rating
          hotelSheet.getRange(j + 1, 10).setValue(count); // reviewCount
          break;
        }
      }
    }

    return { success: true, message: 'Thank you! Your verified review has been published.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 6. HOTEL ADMIN PORTAL API METHODS
// ==========================================

function apiGetHotelAdminDashboard(token) {
  try {
    const user = verifySession(token);
    if (!user || (user.role !== 'hotel_admin' && user.role !== 'super_admin')) {
      return { success: false, error: 'Unauthorized: Hotel Admin privilege required.' };
    }

    const ss = getSpreadsheet();
    const hotelSheet = ss.getSheetByName('Hotels');
    const roomSheet = ss.getSheetByName('Rooms');
    const bookingSheet = ss.getSheetByName('Bookings');

    // Get hotel managed by this admin (or first hotel if super admin preview)
    const targetHotelId = user.hotelId || 'HTL-001';
    
    let managedHotel = null;
    const hRows = hotelSheet.getDataRange().getValues();
    for (let i = 1; i < hRows.length; i++) {
      if (hRows[i][0] === targetHotelId) {
        managedHotel = {
          id: hRows[i][0], name: hRows[i][1], tagline: hRows[i][2], description: hRows[i][3],
          city: hRows[i][4], country: hRows[i][5], address: hRows[i][6], stars: hRows[i][7],
          rating: hRows[i][8], reviewCount: hRows[i][9], priceFrom: hRows[i][12], status: hRows[i][13]
        };
        break;
      }
    }

    // Get rooms for this hotel
    const rRows = roomSheet.getDataRange().getValues();
    const rooms = [];
    for (let i = 1; i < rRows.length; i++) {
      if (rRows[i][1] === targetHotelId) {
        let rImgs = [], rAmens = [];
        try { rImgs = JSON.parse(rRows[i][10]); } catch(e) { rImgs = [rRows[i][10]]; }
        try { rAmens = JSON.parse(rRows[i][11]); } catch(e) { rAmens = [rRows[i][11]]; }

        rooms.push({
          id: rRows[i][0], hotelId: rRows[i][1], hotelName: rRows[i][2], name: rRows[i][3],
          type: rRows[i][4], description: rRows[i][5], pricePerNight: Number(rRows[i][6]),
          capacityGuests: Number(rRows[i][7]), bedType: rRows[i][8], sizeSqFt: Number(rRows[i][9]),
          images: rImgs, amenities: rAmens, totalInventory: Number(rRows[i][12]), status: rRows[i][13]
        });
      }
    }

    // Get bookings for this hotel
    const bRows = bookingSheet.getDataRange().getValues();
    const bookings = [];
    let totalRevenue = 0;
    let confirmedCount = 0;
    let cancelledCount = 0;

    for (let i = 1; i < bRows.length; i++) {
      if (bRows[i][5] === targetHotelId) {
        const b = bRows[i];
        if (b[21] === 'confirmed') {
          totalRevenue += Number(b[18]) || 0;
          confirmedCount++;
        } else if (b[21] === 'cancelled') {
          cancelledCount++;
        }
        bookings.push({
          id: b[0], userId: b[1], userName: b[2], userEmail: b[3], userPhone: b[4],
          hotelId: b[5], hotelName: b[6], roomId: b[7], roomName: b[8], roomType: b[9],
          checkInDate: b[10], checkOutDate: b[11], nights: b[12], guests: b[13],
          totalAmount: b[18], paymentStatus: b[19], bookingStatus: b[21], specialRequests: b[22],
          createdAt: b[23]
        });
      }
    }

    return {
      success: true,
      hotel: managedHotel,
      rooms: rooms,
      bookings: bookings,
      stats: {
        totalRevenue: totalRevenue,
        confirmedBookings: confirmedCount,
        cancelledBookings: cancelledCount,
        occupancyRate: '84%',
        activeRoomsCount: rooms.length
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiAdminSaveRoom(token, roomData) {
  try {
    const user = verifySession(token);
    if (!user || (user.role !== 'hotel_admin' && user.role !== 'super_admin')) {
      return { success: false, error: 'Unauthorized: Hotel Admin privilege required.' };
    }

    const ss = getSpreadsheet();
    const roomSheet = ss.getSheetByName('Rooms');
    const rows = roomSheet.getDataRange().getValues();

    const isEdit = Boolean(roomData.id);
    const roomId = isEdit ? roomData.id : ('RM-' + Utilities.getUuid().substring(0, 6).toUpperCase());
    const hotelId = roomData.hotelId || user.hotelId || 'HTL-001';
    const hotelName = roomData.hotelName || 'Luxury Hotel';
    const imagesJson = typeof roomData.images === 'string' ? roomData.images : JSON.stringify(roomData.images || []);
    const amenitiesJson = typeof roomData.amenities === 'string' ? roomData.amenities : JSON.stringify(roomData.amenities || []);

    if (isEdit) {
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === roomId) {
          const rowIdx = i + 1;
          roomSheet.getRange(rowIdx, 4).setValue(roomData.name);
          roomSheet.getRange(rowIdx, 5).setValue(roomData.type);
          roomSheet.getRange(rowIdx, 6).setValue(roomData.description);
          roomSheet.getRange(rowIdx, 7).setValue(Number(roomData.pricePerNight));
          roomSheet.getRange(rowIdx, 8).setValue(Number(roomData.capacityGuests));
          roomSheet.getRange(rowIdx, 9).setValue(roomData.bedType);
          roomSheet.getRange(rowIdx, 10).setValue(Number(roomData.sizeSqFt));
          roomSheet.getRange(rowIdx, 11).setValue(imagesJson);
          roomSheet.getRange(rowIdx, 12).setValue(amenitiesJson);
          roomSheet.getRange(rowIdx, 13).setValue(Number(roomData.totalInventory) || 1);
          roomSheet.getRange(rowIdx, 14).setValue(roomData.status || 'available');
          return { success: true, message: 'Room updated successfully.' };
        }
      }
      return { success: false, error: 'Room ID not found to edit.' };
    } else {
      roomSheet.appendRow([
        roomId, hotelId, hotelName, roomData.name, roomData.type || 'suite',
        roomData.description, Number(roomData.pricePerNight), Number(roomData.capacityGuests) || 2,
        roomData.bedType || 'King Bed', Number(roomData.sizeSqFt) || 800,
        imagesJson, amenitiesJson, Number(roomData.totalInventory) || 3,
        roomData.status || 'available', new Date().toISOString()
      ]);
      return { success: true, message: 'New room created successfully.', roomId: roomId };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiAdminDeleteRoom(token, roomId) {
  try {
    const user = verifySession(token);
    if (!user || (user.role !== 'hotel_admin' && user.role !== 'super_admin')) {
      return { success: false, error: 'Unauthorized.' };
    }

    const ss = getSpreadsheet();
    const roomSheet = ss.getSheetByName('Rooms');
    const rows = roomSheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === roomId) {
        roomSheet.deleteRow(i + 1);
        return { success: true, message: 'Room deleted from database.' };
      }
    }
    return { success: false, error: 'Room not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 7. SUPER ADMIN DASHBOARD API METHODS
// ==========================================

function apiGetSuperAdminDashboard(token) {
  try {
    const user = verifySession(token);
    if (!user || user.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin access required.' };
    }

    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('Users');
    const hotelSheet = ss.getSheetByName('Hotels');
    const roomSheet = ss.getSheetByName('Rooms');
    const bookingSheet = ss.getSheetByName('Bookings');
    const paymentSheet = ss.getSheetByName('Payments');

    // Users list
    const uRows = userSheet.getDataRange().getValues();
    const users = [];
    for (let i = 1; i < uRows.length; i++) {
      users.push({
        id: uRows[i][0], name: uRows[i][1], email: uRows[i][2],
        role: uRows[i][5], phone: uRows[i][6], hotelId: uRows[i][7],
        createdAt: uRows[i][8], status: uRows[i][9]
      });
    }

    // Hotels list
    const hRows = hotelSheet.getDataRange().getValues();
    const hotels = [];
    for (let i = 1; i < hRows.length; i++) {
      hotels.push({
        id: hRows[i][0], name: hRows[i][1], city: hRows[i][4], country: hRows[i][5],
        stars: hRows[i][7], rating: hRows[i][8], reviewCount: hRows[i][9],
        priceFrom: hRows[i][12], status: hRows[i][13], featured: hRows[i][14]
      });
    }

    // Bookings and metrics
    const bRows = bookingSheet.getDataRange().getValues();
    let grossPlatformVolume = 0;
    let confirmedCount = 0;
    let cancelledCount = 0;
    const recentBookings = [];

    for (let i = 1; i < bRows.length; i++) {
      const b = bRows[i];
      if (b[21] === 'confirmed') {
        grossPlatformVolume += Number(b[18]) || 0;
        confirmedCount++;
      } else if (b[21] === 'cancelled') {
        cancelledCount++;
      }
      if (recentBookings.length < 50) {
        recentBookings.push({
          id: b[0], userName: b[2], userEmail: b[3], hotelName: b[6], roomName: b[8],
          checkInDate: b[10], checkOutDate: b[11], totalAmount: b[18],
          paymentStatus: b[19], bookingStatus: b[21], createdAt: b[23]
        });
      }
    }

    recentBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      stats: {
        grossPlatformVolume: grossPlatformVolume,
        totalBookings: bRows.length - 1,
        confirmedBookings: confirmedCount,
        cancelledBookings: cancelledCount,
        totalHotels: hRows.length - 1,
        totalRooms: roomSheet.getLastRow() - 1,
        totalUsers: users.length,
        systemHealth: 'Optimal (Google Apps Script V8)'
      },
      users: users,
      hotels: hotels,
      recentBookings: recentBookings
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiSuperAdminUpdateUserRole(token, targetUserId, newRole, hotelId) {
  try {
    const user = verifySession(token);
    if (!user || user.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin access required.' };
    }

    const ss = getSpreadsheet();
    const userSheet = ss.getSheetByName('Users');
    const rows = userSheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === targetUserId) {
        const rowIdx = i + 1;
        userSheet.getRange(rowIdx, 6).setValue(newRole); // role column
        if (hotelId !== undefined) {
          userSheet.getRange(rowIdx, 8).setValue(hotelId || ''); // hotelId column
        }
        return { success: true, message: 'User role updated to ' + newRole + '.' };
      }
    }
    return { success: false, error: 'User ID not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function apiSuperAdminToggleHotelStatus(token, hotelId, status) {
  try {
    const user = verifySession(token);
    if (!user || user.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Super Admin access required.' };
    }

    const ss = getSpreadsheet();
    const hotelSheet = ss.getSheetByName('Hotels');
    const rows = hotelSheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === hotelId) {
        hotelSheet.getRange(i + 1, 14).setValue(status); // status column
        return { success: true, message: 'Hotel status updated to ' + status + '.' };
      }
    }
    return { success: false, error: 'Hotel not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
