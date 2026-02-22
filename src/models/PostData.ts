import { PostCategory } from '@/models/PostCategories';
import type { FieldValue, Timestamp } from 'firebase/firestore';

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export interface PostData {
  postId: string;
  createdBy: string; // Uid til brukeren fra Firestore
  createdByDisplayName: string; // Navn på bruker som lagde post
  title: string;
  description: string;
  date?: Date;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  maxCapacity: number;
  participantsUids: string[]; // array med Uid fra Firestore
  categories: PostCategory[];
  status: 'active' | 'upcoming' | 'completed'; // Trengs det flere?
  likes?: string[]; // Uid til andre brukere fra Firestore
  comments: string[]; // kommentarer til post
  images?: string[]; // bilder lastet opp til dugnadssiden. Uid fra Firestore, lagret i Firebase Storage
  createdAt?: Timestamp | FieldValue | null; // serverTimestamp() returnerer en Fieldvalue for `FieldValue.serverTimestamp`
  updatedAt?: Timestamp | FieldValue | null;
}

export type CreatePostInput = {
  title: string;
  description: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  images?: string[];
  categories: PostCategory[];
  maxCapacity: number;
};

export interface CommentObject {
  id: string;
  comment: CommentData;
}

// Innholdet i en kommentar
export interface CommentData {
  commentId: string;
  postId: string;
  authorUid: string;
  authorName: string;
  commentText: string;
  images?: string[];
  createdAt?: Timestamp | null;
}
