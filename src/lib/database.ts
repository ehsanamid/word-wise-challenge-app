
import { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';

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
  English: string;
  Persian: string;
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

// SQLite database instance
let SQL: any;
let db: any;
// Track the last example shown to each user
const lastExampleShown: Record<number, number> = {};

// Initialize SQL.js
export const initDatabase = async () => {
  try {
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    // For real application, we would load the actual database file
    // For now, we create an in-memory database with the schema
    db = new SQL.Database();
    
    // Create tables matching the schema
    db.run(`
      CREATE TABLE IF NOT EXISTS tblWord (
        wordID INTEGER PRIMARY KEY,
        word TEXT,
        type TEXT,
        difficulty TEXT,
        pronunciation TEXT
      );
      
      CREATE TABLE IF NOT EXISTS tblDefinition (
        definitionID INTEGER PRIMARY KEY,
        wordID INTEGER,
        definition TEXT,
        FOREIGN KEY (wordID) REFERENCES tblWord(wordID)
      );
      
      CREATE TABLE IF NOT EXISTS tblExample (
        exampleID INTEGER PRIMARY KEY,
        definitionID INTEGER,
        English TEXT,
        Persian TEXT,
        FOREIGN KEY (definitionID) REFERENCES tblDefinition(definitionID)
      );
      
      CREATE TABLE IF NOT EXISTS tblUser (
        UserID INTEGER PRIMARY KEY,
        user TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
      );
      
      CREATE TABLE IF NOT EXISTS tblPractice (
        ID INTEGER PRIMARY KEY,
        UserID INTEGER,
        exampleID INTEGER,
        score INTEGER,
        FOREIGN KEY (UserID) REFERENCES tblUser(UserID),
        FOREIGN KEY (exampleID) REFERENCES tblExample(exampleID)
      );
    `);

    // Insert some sample data for testing
    insertSampleData();
    
    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    return null;
  }
};

// Insert sample data for testing
const insertSampleData = () => {
  // Sample words with different difficulty levels
  db.run(`
    INSERT INTO tblWord (wordID, word, type, difficulty, pronunciation) VALUES 
    (1, 'hello', 'noun', '100', 'həˈloʊ'),
    (2, 'book', 'noun', '100', 'bʊk'),
    (3, 'computer', 'noun', '1000', 'kəmˈpjuːtər'),
    (4, 'education', 'noun', '3000', 'ˌɛdʒʊˈkeɪʃən'),
    (5, 'opportunity', 'noun', '5000', 'ˌɑːpərˈtuːnəti'),
    (6, 'philosophy', 'noun', '10000', 'fəˈlɑːsəfi');
  `);

  // Sample definitions
  db.run(`
    INSERT INTO tblDefinition (definitionID, wordID, definition) VALUES 
    (1, 1, 'Used as a greeting'),
    (2, 2, 'A written or printed work consisting of pages'),
    (3, 3, 'An electronic device for storing and processing data'),
    (4, 4, 'The process of receiving or giving systematic instruction'),
    (5, 5, 'A time or set of circumstances that makes it possible to do something'),
    (6, 6, 'The study of the fundamental nature of knowledge, reality, and existence');
  `);

  // Sample examples with Persian translations
  db.run(`
    INSERT INTO tblExample (exampleID, definitionID, English, Persian) VALUES 
    (1, 1, 'Hello, how are you?', 'سلام، حال شما چطور است؟'),
    (2, 2, 'I am reading an interesting book.', 'من دارم یک کتاب جالب می‌خوانم.'),
    (3, 3, 'I need to fix my computer.', 'من باید کامپیوترم را تعمیر کنم.'),
    (4, 4, 'Education is important for everyone.', 'آموزش برای همه مهم است.'),
    (5, 5, 'This is a great opportunity to learn.', 'این یک فرصت عالی برای یادگیری است.'),
    (6, 6, 'She studies philosophy at university.', 'او در دانشگاه فلسفه می‌خواند.');
  `);

  // Sample users (passwords would be hashed in real application)
  db.run(`
    INSERT INTO tblUser (UserID, user, email, password) VALUES 
    (1, 'user1', 'user1@example.com', 'password123');
  `);

  // Sample practice records
  db.run(`
    INSERT INTO tblPractice (ID, UserID, exampleID, score) VALUES 
    (1, 1, 1, 95),
    (2, 1, 2, 80);
  `);
};

// Database query functions
export const executeQuery = (query: string, params: any[] = []): any[] => {
  try {
    if (!db) {
      throw new Error("Database not initialized");
    }
    const stmt = db.prepare(query);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error("Query error:", error);
    return [];
  }
};

// Database operations for the app
export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      setIsInitialized(true);
    };
    
    if (!isInitialized) {
      init();
    }
    
    return () => {
      // Clean up if needed
    };
  }, [isInitialized]);

  // User authentication
  const registerUser = (username: string, email: string, password: string): number => {
    try {
      // In a real app, we would hash the password
      db.run('INSERT INTO tblUser (user, email, password) VALUES (?, ?, ?)', [username, email, password]);
      const result = executeQuery('SELECT last_insert_rowid() as UserID');
      return result[0]?.UserID || -1;
    } catch (error) {
      console.error("Registration error:", error);
      return -1;
    }
  };

  const loginUser = (username: string, password: string): User | null => {
    try {
      const result = executeQuery(
        'SELECT * FROM tblUser WHERE user = ? AND password = ?', 
        [username, password]
      );
      return result.length > 0 ? result[0] as User : null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  // Get examples by difficulty
  const getExamplesByDifficulty = (difficulty: string): Example[] => {
    try {
      const result = executeQuery(`
        SELECT e.* 
        FROM tblExample e
        JOIN tblDefinition d ON e.definitionID = d.definitionID
        JOIN tblWord w ON d.wordID = w.wordID
        WHERE w.difficulty = ?
      `, [difficulty]);
      return result as Example[];
    } catch (error) {
      console.error("Error fetching examples:", error);
      return [];
    }
  };

  // Get user practice examples
  const getUserPractice = (userId: number): Practice[] => {
    try {
      const result = executeQuery(
        'SELECT * FROM tblPractice WHERE UserID = ?', 
        [userId]
      );
      return result as Practice[];
    } catch (error) {
      console.error("Error fetching user practice:", error);
      return [];
    }
  };

  // Get example info including word
  const getExampleInfo = (exampleId: number) => {
    try {
      const result = executeQuery(`
        SELECT e.*, d.definition, w.word, w.pronunciation, w.type
        FROM tblExample e
        JOIN tblDefinition d ON e.definitionID = d.definitionID
        JOIN tblWord w ON d.wordID = w.wordID
        WHERE e.exampleID = ?
      `, [exampleId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Error fetching example info:", error);
      return null;
    }
  };

  // Save practice score
  const savePracticeScore = (userId: number, exampleId: number, score: number): boolean => {
    try {
      // Check if a practice record already exists
      const existing = executeQuery(
        'SELECT * FROM tblPractice WHERE UserID = ? AND exampleID = ?',
        [userId, exampleId]
      );
      
      if (existing.length > 0) {
        // Update existing record
        db.run(
          'UPDATE tblPractice SET score = ? WHERE UserID = ? AND exampleID = ?',
          [score, userId, exampleId]
        );
      } else {
        // Create new record
        db.run(
          'INSERT INTO tblPractice (UserID, exampleID, score) VALUES (?, ?, ?)',
          [userId, exampleId, score]
        );
      }
      return true;
    } catch (error) {
      console.error("Error saving practice score:", error);
      return false;
    }
  };

  // Get next practice example
  const getNextPracticeExample = (userId: number, difficulty: string): any => {
    try {
      // Get the ID of the last example shown to this user
      const lastExampleId = lastExampleShown[userId] || -1;
      
      // First try to get examples with score less than 100, excluding the last example
      const lowScoreExamples = executeQuery(`
        SELECT e.*, p.score 
        FROM tblExample e
        JOIN tblPractice p ON e.exampleID = p.exampleID
        JOIN tblDefinition d ON e.definitionID = d.definitionID
        JOIN tblWord w ON d.wordID = w.wordID
        WHERE p.UserID = ? AND p.score < 100 AND w.difficulty = ? AND e.exampleID != ?
        ORDER BY RANDOM()
        LIMIT 1
      `, [userId, difficulty, lastExampleId]);
      
      if (lowScoreExamples.length > 0) {
        // Update the last example shown for this user
        lastExampleShown[userId] = lowScoreExamples[0].exampleID;
        return lowScoreExamples[0];
      }
      
      // If no low score examples, get a random unpracticed example, excluding the last one
      const unpracticedExamples = executeQuery(`
        SELECT e.* 
        FROM tblExample e
        JOIN tblDefinition d ON e.definitionID = d.definitionID
        JOIN tblWord w ON d.wordID = w.wordID
        WHERE w.difficulty = ? AND e.exampleID NOT IN (
          SELECT exampleID FROM tblPractice WHERE UserID = ?
        ) AND e.exampleID != ?
        ORDER BY RANDOM()
        LIMIT 1
      `, [difficulty, userId, lastExampleId]);
      
      if (unpracticedExamples.length > 0) {
        // Update the last example shown for this user
        lastExampleShown[userId] = unpracticedExamples[0].exampleID;
        return unpracticedExamples[0];
      }
      
      // If all examples have been practiced and scored >= 100, just get a random one excluding the last one
      const randomExamples = executeQuery(`
        SELECT e.* 
        FROM tblExample e
        JOIN tblDefinition d ON e.definitionID = d.definitionID
        JOIN tblWord w ON d.wordID = w.wordID
        WHERE w.difficulty = ? AND e.exampleID != ?
        ORDER BY RANDOM()
        LIMIT 1
      `, [difficulty, lastExampleId]);
      
      if (randomExamples.length > 0) {
        // Update the last example shown for this user
        lastExampleShown[userId] = randomExamples[0].exampleID;
        return randomExamples[0];
      }
      
      // If there's only one example for this difficulty level, we have to use it
      const anyExample = executeQuery(`
        SELECT e.* 
        FROM tblExample e
        JOIN tblDefinition d ON e.definitionID = d.definitionID
        JOIN tblWord w ON d.wordID = w.wordID
        WHERE w.difficulty = ?
        ORDER BY RANDOM()
        LIMIT 1
      `, [difficulty]);
      
      if (anyExample.length > 0) {
        // Update the last example shown, even if it's the same
        lastExampleShown[userId] = anyExample[0].exampleID;
        return anyExample[0];
      }
      
      return null;
    } catch (error) {
      console.error("Error getting next practice example:", error);
      return null;
    }
  };

  return {
    isInitialized,
    registerUser,
    loginUser,
    getExamplesByDifficulty,
    getUserPractice,
    getExampleInfo,
    savePracticeScore,
    getNextPracticeExample
  };
};
