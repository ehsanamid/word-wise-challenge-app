
import { useState, useEffect } from 'react';
import { User } from './types';
import { loginUser, registerUser } from './userOperations';
import { getExamplesByDifficulty, getExampleInfo } from './exampleOperations';
import { getUserPractice, savePracticeScore, getNextPracticeExample } from './practiceOperations';

// Database hook that provides all database operations
export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

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

// Re-export types and functions for direct imports
export * from './types';
