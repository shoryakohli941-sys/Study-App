import Dexie, { type Table } from 'dexie';

export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';
export type ErrorType = 'Concept Gap' | 'Silly Slip';

export interface Mistake {
  id?: number;
  imageData: string; // compressed base64 data URL
  subject: Subject;
  chapter: string;
  subtopic: string;
  theTrap: string;
  keyFormula: string;
  errorType: ErrorType;
  nextReviewDate: number;
  reviewStage: number; // 0, 1, 2, 3
  createdAt: number;
}

export class OrbitDB extends Dexie {
  mistakes!: Table<Mistake>;

  constructor() {
    super('OrbitDB');
    this.version(1).stores({
      mistakes: '++id, subject, chapter, subtopic, errorType, nextReviewDate, reviewStage, createdAt'
    });
  }
}

export const db = new OrbitDB();
