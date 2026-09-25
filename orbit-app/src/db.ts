import Dexie, { type Table } from 'dexie';

export interface Mistake {
  id?: number;
  imageData: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  subtopic: string;
  theTrap: string;
  keyFormula: string;
  errorType: "Concept Gap" | "Silly Slip";
  nextReviewDate: number;
  reviewStage: number; // 0, 1, 2, 3
  createdAt: number;
}

export class OrbitDatabase extends Dexie {
  mistakes!: Table<Mistake>;

  constructor() {
    super('OrbitDB');
    this.version(1).stores({
      mistakes: '++id, subject, chapter, subtopic, errorType, nextReviewDate, reviewStage, createdAt'
    });
  }
}

export const db = new OrbitDatabase();
