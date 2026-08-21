export type LocaleCode = 'es' | 'en';

export type LocalizedString = Record<LocaleCode, string>;

export type LocalizedStringList = Record<LocaleCode, string[]>;

export interface SocialLinkDoc {
  id: string;
  label: string;
  url: string;
  iconUrl?: string;
}

export interface SiteSettingsDoc {
  _id: string;
  _type: 'siteSettings';
  name: string;
  brandHandle: string;
  emails: string[];
  socialLinks: SocialLinkDoc[];
}

export interface ProfileDoc {
  _id: string;
  _type: 'profile';
  imageUrl: string;
  role: LocalizedString;
  pitch: LocalizedString;
  paragraphs: LocalizedString[];
  focusAreas: LocalizedStringList;
}

export interface ProjectFeatureDoc {
  id: string;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
}

export interface ProjectGalleryItemDoc {
  id: string;
  imageUrl: string;
  title: LocalizedString;
  caption: LocalizedString;
}

export interface ProjectDetailDoc {
  summary: LocalizedString;
  role: LocalizedString;
  duration: LocalizedString;
  team: LocalizedString;
  year: string;
  client: LocalizedString;
  body: LocalizedString[];
  features: ProjectFeatureDoc[];
  gallery: ProjectGalleryItemDoc[];
}

export interface ProjectDoc {
  _id: string;
  _type: 'project';
  slug: { current: string };
  title: string;
  description: LocalizedString;
  technologies: string[];
  technologyIconUrls: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
  detail: ProjectDetailDoc;
}

export interface ExperienceDoc {
  _id: string;
  _type: 'experience';
  slug: { current: string };
  company: string;
  role: LocalizedString;
  duration: LocalizedString;
  responsibilities: LocalizedStringList;
  imageUrl: string;
  sortOrder: number;
}

export interface CourseDoc {
  _id: string;
  _type: 'course';
  slug: { current: string };
  title: LocalizedString;
  institution: string;
  date: LocalizedString;
  imageUrl: string;
  credentialUrl?: string;
  sortOrder: number;
}

export interface NavItemDoc {
  id: string;
  label: LocalizedString;
}

export interface NavigationDoc {
  _id: string;
  _type: 'navigation';
  items: NavItemDoc[];
}

export const SECTION_IDS = ['about', 'projects', 'experience', 'courses'] as const;

export const FEATURE_ICONS = [
  'shield',
  'bell',
  'terminal',
  'users',
  'api',
  'mobile',
  'code',
  'database',
] as const;

export function emptyLocalized(): LocalizedString {
  return { es: '', en: '' };
}

export function emptyLocalizedList(): LocalizedStringList {
  return { es: [], en: [] };
}
