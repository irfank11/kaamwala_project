export type Role = 'customer' | 'worker' | 'admin';
export type PricingType = 'hourly' | 'daily' | 'fixed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  city: string;
  avatar_url: string | null;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProfileContact {
  full_name: string;
  phone: string;
  city: string;
  avatar_url: string | null;
}

export interface WorkerProfileRow {
  id: string;
  headline: string;
  bio: string;
  years_experience: number;
  skills: string[];
  pricing_type: PricingType;
  price: number;
  city: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  service_radius_km: number;
  working_days: DayKey[];
  start_time: string;
  end_time: string;
  is_available: boolean;
  approval_status: ApprovalStatus;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface WorkerCategoryLink {
  expertise: string;
  category: ServiceCategory;
}

export interface WorkerListing extends WorkerProfileRow {
  profile: ProfileContact | null;
  worker_categories: WorkerCategoryLink[];
}

export interface PortfolioImage {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

export interface WorkerDetail extends WorkerListing {
  portfolio_images: PortfolioImage[];
}

export interface Review {
  id: string;
  worker_id: string;
  customer_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface AdminReview extends Review {
  worker: { profile: { full_name: string } | null } | null;
}
