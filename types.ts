
export interface Lecture {
  id: number;
  title: string;
  // Store duration in seconds for consistency; format on display
  durationSeconds?: number;
  videoUrl?: string;
}

export interface CurriculumSection {
  section: string;
  lectures: Lecture[];
}

export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  // Display name for instructor if available. Keep id separate if needed elsewhere.
  instructorName?: string;
  instructorId?: number;
  rating: number;
  // Total duration in hours across lectures (approx), optional if not provided by backend
  duration?: number;
  lecturesCount?: number;
  level?: string;
  language?: string;
  lastUpdated?: string;
  students: number;
  // Price always numeric; use isFree to mark free courses
  price: number;
  isFree?: boolean;
  imageUrl: string;
  features?: string[];
  // Only present on detail fetches
  curriculum?: CurriculumSection[];
  requirements?: string[];
  learningPoints?: string[];
}
