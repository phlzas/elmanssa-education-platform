
export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  instructor: string;
  rating: number;
  duration: number; // in hours
  lecturesCount?: number;
  level?: string;
  language?: string;
  lastUpdated?: string;
  students: number;
  price: number | 'free';
  imageUrl: string;
  features?: string[];
  curriculum?: {
    section: string;
    lectures: string[];
  }[];
  requirements?: string[];
  learningPoints?: string[];
}
