export interface Event {
  id?: number;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  userId?: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories: string[];
  tags: string[];
  capacity: number;
  price: number;
}
