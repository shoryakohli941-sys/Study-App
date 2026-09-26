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

export interface ScoreData {
  physics: { plus: number; minus: number };
  chemistry: { plus: number; minus: number };
  mathematics: { plus: number; minus: number };
}

export interface CalendarEvent {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Mock Test' | 'Study Block / Revision' | 'Coaching Class' | 'School / Holiday' | 'Goal / Milestone' | 'General';
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  details?: string;
  scoreData?: ScoreData;
  createdAt: number;
}

export interface PlannerTask {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  subject: "Physics" | "Chemistry" | "Mathematics" | "General";
  completed: boolean;
  priority: number;
  createdAt: number;
}

export class OrbitDatabase extends Dexie {
  mistakes!: Table<Mistake>;
  calendarEvents!: Table<CalendarEvent>;
  plannerTasks!: Table<PlannerTask>;

  constructor() {
    super('OrbitDB');
    this.version(1).stores({
      mistakes: '++id, subject, chapter, subtopic, errorType, nextReviewDate, reviewStage, createdAt'
    });
    this.version(2).stores({
      mistakes: '++id, subject, chapter, subtopic, errorType, nextReviewDate, reviewStage, createdAt',
      calendarEvents: '++id, date, title, category, details, scoreData, createdAt',
      plannerTasks: '++id, date, title, subject, completed, priority, createdAt'
    });
    this.version(3).stores({
      mistakes: '++id, subject, chapter, subtopic, errorType, nextReviewDate, reviewStage, createdAt',
      calendarEvents: '++id, date, title, category, isAllDay, startTime, endTime, details, scoreData, createdAt',
      plannerTasks: '++id, date, title, subject, completed, priority, createdAt'
    }).upgrade(tx => {
      return tx.table("calendarEvents").toCollection().modify(event => {
        if (event.isAllDay === undefined) {
          event.isAllDay = true;
        }
        if (event.category === 'Coaching / Class') event.category = 'Coaching Class';
        if (event.category === 'School Holiday') event.category = 'School / Holiday';
        if (event.category === 'Revision Target') event.category = 'Study Block / Revision';
      });
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
