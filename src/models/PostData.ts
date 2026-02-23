import { InjuryLocation } from '@/models/PostCategories';
import type { FieldValue, Timestamp } from 'firebase/firestore';

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export type InjuryStatus = 'ny skade' | 'forbedres' | 'stabil' | 'forverres' | 'frisk';

export interface PostData {
  // ID på skade
  postId: string;

  // eier av skaden
  createdBy: string; // uid for bruker
  createdByDisplayName?: string;

  // kjernefelter
  injuryLocation: InjuryLocation;
  painLevel: number; // 0-10
  swelling: boolean;
  mobilityLimit: boolean;
  temperature: number; // 34-42
  description?: string;

  // bilde(r) av skade - obligatorisk minst 1
  images: string[];

  // beregnet før lagring
  statusIndicator: InjuryStatus;
  statusExplanation: string;

  // timestamps
  createdAt?: Timestamp | FieldValue | null;
  updatedAt?: Timestamp | FieldValue | null;

  // (legacy fields)
  title?: string;
  categories?: string[];
  maxCapacity?: number;
  participantsUids?: string[];
  likes?: string[];
  comments?: string[];
  address?: string;
  coordinates?: { latitude: number; longitude: number };
}

export type CreatePostInput = {
  title: string;
  description?: string;
  images: string[];
  injuryLocation: InjuryLocation;
  painLevel: number;
  swelling: boolean;
  mobilityLimit: boolean;
  temperature: number;
  statusIndicator: InjuryStatus;
  statusExplanation: string;
};

export interface CommentObject {
  id: string;
  comment: CommentData;
}

// Innhold i en kommentar
export interface CommentData {
  commentId: string;
  postId: string;
  authorUid: string;
  authorName: string;
  commentText: string;
  images?: string[];
  createdAt?: Timestamp | null;
}
