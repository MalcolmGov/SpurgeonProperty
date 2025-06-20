// Production constants and configuration

export const APP_CONFIG = {
  name: 'Spurgeon Property',
  description: 'Premium South African Real Estate Platform',
  version: '1.0.0',
  domain: process.env.NODE_ENV === 'production' 
    ? 'https://www.spurgeonproperty.co.za' 
    : 'http://localhost:5000',
  supportEmail: 'peter@spurgeonproperty.com',
  phone: '+27 (0) 21 XXX XXXX'
};

export const API_ENDPOINTS = {
  properties: '/api/properties',
  agents: '/api/agents',
  leads: '/api/leads',
  upload: '/api/upload',
  chat: '/api/chat',
  health: '/health',
  metrics: '/api/metrics'
};

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
  { value: 'villa', label: 'Villa', icon: '🏖️' },
  { value: 'estate', label: 'Estate', icon: '🏰' },
  { value: 'farm', label: 'Farm', icon: '🚜' },
  { value: 'land', label: 'Land', icon: '🌾' },
  { value: 'commercial', label: 'Commercial', icon: '🏢' }
];

export const SA_PROVINCES = [
  { value: 'western-cape', label: 'Western Cape' },
  { value: 'gauteng', label: 'Gauteng' },
  { value: 'kwazulu-natal', label: 'KwaZulu-Natal' },
  { value: 'eastern-cape', label: 'Eastern Cape' },
  { value: 'free-state', label: 'Free State' },
  { value: 'limpopo', label: 'Limpopo' },
  { value: 'mpumalanga', label: 'Mpumalanga' },
  { value: 'north-west', label: 'North West' },
  { value: 'northern-cape', label: 'Northern Cape' }
];

export const PROPERTY_FEATURES = [
  'Swimming Pool',
  'Garden',
  'Garage',
  'Security System',
  'Air Conditioning',
  'Fireplace',
  'Balcony',
  'Study',
  'Guest Toilet',
  'Ensuite Bathroom',
  'Walk-in Closet',
  'Laundry Room',
  'Pantry',
  'Braai Area',
  'Servant\'s Quarters',
  'Borehole',
  'Solar Panels',
  'Inverter',
  'Generator',
  'Electric Fencing',
  'Alarm System',
  'CCTV',
  'Intercom',
  'Remote Garage',
  'Covered Parking',
  'Storage Room',
  'Wine Cellar',
  'Gym/Fitness Room',
  'Entertainment Area',
  'Staff Accommodation'
];

export const PRICE_RANGES = [
  { min: 0, max: 500000, label: 'Under R500k' },
  { min: 500000, max: 1000000, label: 'R500k - R1M' },
  { min: 1000000, max: 2000000, label: 'R1M - R2M' },
  { min: 2000000, max: 5000000, label: 'R2M - R5M' },
  { min: 5000000, max: 10000000, label: 'R5M - R10M' },
  { min: 10000000, max: null, label: 'R10M+' }
];

export const FILE_UPLOAD_LIMITS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles: 20
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'],
    maxFiles: 5
  }
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultOffset: 0
};

export const PERFORMANCE_THRESHOLDS = {
  apiResponseTime: 200, // ms
  pageLoadTime: 3000, // ms
  imageLoadTime: 1000, // ms
  memoryUsage: 500 // MB
};

export const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' }
];

export const CONTACT_TIMES = [
  { value: 'morning', label: 'Morning (8AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
  { value: 'evening', label: 'Evening (5PM - 8PM)' },
  { value: 'anytime', label: 'Anytime' }
];

export const INQUIRY_TYPES = [
  { value: 'viewing', label: 'Schedule Viewing', icon: '👁️' },
  { value: 'info', label: 'Request Information', icon: 'ℹ️' },
  { value: 'financing', label: 'Financing Help', icon: '💰' },
  { value: 'negotiation', label: 'Price Negotiation', icon: '🤝' }
];

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'qualified', label: 'Qualified', color: 'green' },
  { value: 'viewing', label: 'Viewing Scheduled', color: 'purple' },
  { value: 'negotiating', label: 'Negotiating', color: 'orange' },
  { value: 'closed', label: 'Closed', color: 'gray' }
];

export const LEAD_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
];

export const CURRENCY_FORMAT = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const NUMBER_FORMAT = new Intl.NumberFormat('en-ZA');

export const DATE_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export const TIME_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  hour: '2-digit',
  minute: '2-digit'
});