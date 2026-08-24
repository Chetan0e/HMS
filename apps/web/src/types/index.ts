export type Role = 'SEEKER' | 'OWNER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  profile_image?: string;
  account_status: string;
  verification_status: string;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  manager_ids?: string[];
  name: string;
  slug: string;
  property_type: string;
  gender_policy: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  nearby_places: string[];
  images: string[];
  amenities: string[];
  rules: string[];
  pricing_starting_from?: number;
  deposit: number;
  minimum_stay: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected' | 'Changes Required';
  property_status: 'Draft' | 'Pending Verification' | 'Published' | 'Suspended' | 'Archived';
  rating: number;
  review_count: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number;
  price: number;
  deposit: number;
  amenities: string[];
  description: string;
  status: string;
  available_beds: number;
  total_beds: number;
  beds?: Bed[];
}

export interface Bed {
  id: string;
  property_id: string;
  room_id: string;
  bed_number: string;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
  resident_id?: string;
  booking_id?: string;
}

export interface Booking {
  id: string;
  seeker_id: string;
  owner_id: string;
  property_id: string;
  room_id: string;
  bed_id?: string;
  move_in_date: string;
  stay_duration: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  created_at: string;
  property_name?: string;
  seeker_name?: string;
}

export interface Visit {
  id: string;
  seeker_id: string;
  owner_id: string;
  property_id: string;
  proposed_date: string;
  proposed_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  created_at: string;
  property_name?: string;
  seeker_name?: string;
}

export interface Enquiry {
  id: string;
  seeker_id: string;
  owner_id: string;
  property_id: string;
  room_id?: string;
  message: string;
  status: 'OPEN' | 'RESPONDED' | 'CLOSED';
  created_at: string;
  property_name?: string;
  seeker_name?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface ResidentStay {
  id: string;
  seeker_id: string;
  owner_id: string;
  property_id: string;
  room_id: string;
  bed_id?: string;
  move_in_date: string;
  status: string;
  property_name?: string;
  property_address?: string;
  property_city?: string;
  property_image?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  room_number?: string;
  room_type?: string;
  monthly_rent?: number;
  deposit?: number;
  bed_number?: string;
}

export interface MaintenanceItem {
  id: string;
  property_id: string;
  room_id: string;
  seeker_id: string;
  owner_id: string;
  category: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  property_name?: string;
}

