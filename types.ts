
export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  instructor: string;
  rating: number;
  duration: number; // in hours
  students: number;
  price: number | 'free';
  imageUrl: string;
}
