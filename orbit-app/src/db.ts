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

// Seed data for immediate demonstration
db.on('populate', () => {
  db.mistakes.add({
    // A tiny transparent 1x1 gif data URL just for the sample if no image is available
    imageData: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    subject: "Physics",
    chapter: "Rotational Mechanics",
    subtopic: "Rolling Friction",
    theTrap: "Assuming static friction does no work in pure rolling, but forgetting that sliding friction DOES dissipate energy when rolling with slipping.",
    keyFormula: "v = ωR (pure rolling condition)",
    errorType: "Concept Gap",
    nextReviewDate: Date.now() - 1000, // Make it due immediately
    reviewStage: 0,
    createdAt: Date.now() - 86400000, // Created 1 day ago
  });
});
