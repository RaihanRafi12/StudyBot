import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Type helpers matching the DB schema ──────────────────────────────────────

export type UserRole = 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin'

export interface DBUser {
  id: string
  name: string
  email: string
  role: UserRole
  institution: string | null
  major: string | null
  study_year: string | null
  points: number
  upload_count: number
  access_count: number
  monthly_access: number
  status: 'active' | 'suspended'
  created_at: string
}

export interface DBResource {
  id: string
  title: string
  category: 'Courses' | 'Projects' | 'Research' | 'Documents'
  uploader_id: string
  description: string | null
  full_details: string | null
  is_public: boolean
  external_link: string | null
  rating: number
  review_count: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  // joined
  users?: { name: string }
  resource_topics?: { topic_name: string }[]
  resource_files?: { id: string; file_name: string; file_size: string; file_type: string; file_url: string }[]
}

export interface DBAccessRequest {
  id: string
  user_id: string
  resource_id: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  users?: { name: string }
  resources?: { title: string }
}

export interface DBReport {
  id: string
  resource_id: string
  reported_by: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  resources?: { title: string }
  users?: { name: string }
}

export interface DBReview {
  id: string
  resource_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface DBCalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  event_type: 'exam' | 'deadline' | 'reminder' | 'class'
  event_date: string
  created_at: string
}

export interface DBActivityLog {
  id: string
  user_id: string
  activity_type: 'request' | 'review' | 'upload'
  message: string
  created_at: string
}

export interface DBNotification {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
}
