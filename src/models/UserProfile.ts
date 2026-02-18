import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  userUid: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  role: 'user' | 'admin';
  createdAt?: Timestamp;
}
