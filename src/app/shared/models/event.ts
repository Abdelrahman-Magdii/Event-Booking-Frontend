export interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  date: Date;
  venue: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  startTime: string;
  endTime: string;
}
