import Dexie, { type EntityTable } from 'dexie';

export type Subject = "Physics" | "Chemistry" | "Mathematics";
export type ErrorType = "Concept Gap" | "Silly Slip";

export interface Mistake {
  id?: number;
  imageData: string;
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

const db = new Dexie('OrbitDB') as Dexie & {
  mistakes: EntityTable<Mistake, 'id'>;
};

// ++id is auto-increment
db.version(1).stores({
  mistakes: '++id, subject, chapter, subtopic, errorType, nextReviewDate, reviewStage, createdAt'
});

export { db };
