import { Resource } from '../components/resource-card';
import type { ApiUser } from './api';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  institution: string;
  major: string;
  year: string;
  points: number;
  uploadCount: number;
  accessCount: number;
  monthlyAccess: number;
  role?: string;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const detail = (error as { response?: { data?: { detail?: string } } }).response?.data
      ?.detail;
    if (detail) return detail;
  }
  return fallback;
}

export function normalizeCategory(category: string): string {
  const key = category.toLowerCase();
  const map: Record<string, string> = {
    courses: 'Courses',
    documents: 'Documents',
    projects: 'Projects',
    research: 'Research',
  };
  return map[key] || category;
}

export function mapApiResource(raw: Record<string, unknown>): Resource {
  const files = (raw.files as Array<Record<string, unknown>>) || [];
  return {
    id: String(raw.id),
    title: String(raw.title),
    category: String(raw.category),
    uploader: String(raw.uploader ?? 'Unknown'),
    uploaderId: String(raw.uploader_id),
    isPublic: Boolean(raw.is_public),
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.review_count ?? 0),
    description: String(raw.description ?? ''),
    hasAccess: Boolean(raw.has_access),
    accessRequested: Boolean(raw.access_requested),
    uploadDate: raw.upload_date ? String(raw.upload_date) : undefined,
    fullDetails: raw.full_details ? String(raw.full_details) : undefined,
    topics: (raw.topics as string[]) || [],
    externalLink: raw.external_link ? String(raw.external_link) : undefined,
    files: files.map((f) => ({
      id: String(f.id),
      name: String(f.name),
      size: f.size ? String(f.size) : '',
      type: f.file_type ? String(f.file_type) : 'file',
    })),
  };
}

export function apiUserToAppUser(
  u: ApiUser,
  counts?: { uploadCount?: number; accessCount?: number },
): AppUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    institution: u.institution ?? '',
    major: u.major ?? '',
    year: u.year ?? '',
    points: u.points,
    uploadCount: counts?.uploadCount ?? 0,
    accessCount: counts?.accessCount ?? 0,
    monthlyAccess: u.monthly_access_count,
    role: u.role,
  };
}

export function countUserResources(resources: Resource[], userId: string) {
  return {
    uploadCount: resources.filter((r) => r.uploaderId === userId).length,
    accessCount: resources.filter((r) => r.hasAccess && r.uploaderId !== userId).length,
  };
}
