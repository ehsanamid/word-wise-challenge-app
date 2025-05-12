
// Type definitions for database operations
export interface Word {
  wordID: number;
  word: string;
  type: string;
  difficulty: string;
  pronunciation: string;
}

export interface Definition {
  definitionID: number;
  wordID: number;
  definition: string;
}

export interface Example {
  exampleID: number;
  definitionID: number;
  english: string;
  persian: string;
}

export interface User {
  UserID: number;
  user: string;
  email: string;
  password: string;
}

export interface Practice {
  ID: number;
  UserID: number;
  exampleID: number;
  score: number;
}
