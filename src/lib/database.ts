
import { useState, useEffect } from 'react';
import { supabase, lastExampleShown } from '@/integrations/supabase/client';

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

// Database operations for the app
export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // User authentication
  const registerUser = async (username: string, email: string, password: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('tbluser')
        .insert([{ username, email, password }])
        .select('userid')
        .single();
      
      if (error) throw error;
      
      return data?.userid || -1;
    } catch (error) {
      console.error("Registration error:", error);
      return -1;
    }
  };

  const loginUser = async (username: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('tbluser')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error) {
        console.error("Login error:", error);
        return null;
      }
      
      return data as unknown as User;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  // Get examples by difficulty
  const getExamplesByDifficulty = async (difficulty: string): Promise<Example[]> => {
    try {
      const { data, error } = await supabase
        .from('tblexample')
        .select(`
          exampleid,
          definitionid,
          english,
          persian,
          tblDefinition:definitionid(
            tblWord:wordid(
              difficulty
            )
          )
        `)
        .eq('tblDefinition.tblWord.difficulty', difficulty);
      
      if (error) throw error;
      
      return (data || []) as unknown as Example[];
    } catch (error) {
      console.error("Error fetching examples:", error);
      return [];
    }
  };

  // Get user practice examples
  const getUserPractice = async (userId: number): Promise<Practice[]> => {
    try {
      const { data, error } = await supabase
        .from('tblpractice')
        .select('*')
        .eq('userid', userId);
      
      if (error) throw error;
      
      return (data || []) as unknown as Practice[];
    } catch (error) {
      console.error("Error fetching user practice:", error);
      return [];
    }
  };

  // Get example info including word
  const getExampleInfo = async (exampleId: number) => {
    try {
      const { data, error } = await supabase
        .from('tblexample')
        .select(`
          exampleid,
          english,
          persian,
          tblDefinition:definitionid(
            definition,
            tblWord:wordid(
              word,
              pronunciation,
              type
            )
          )
        `)
        .eq('exampleid', exampleId)
        .single();
      
      if (error) throw error;
      
      // Format the data to match the expected structure
      return {
        ...data,
        definition: data.tblDefinition?.definition,
        word: data.tblDefinition?.tblWord?.word,
        pronunciation: data.tblDefinition?.tblWord?.pronunciation,
        type: data.tblDefinition?.tblWord?.type
      };
    } catch (error) {
      console.error("Error fetching example info:", error);
      return null;
    }
  };

  // Save practice score
  const savePracticeScore = async (userId: number, exampleId: number, score: number): Promise<boolean> => {
    try {
      // Check if a practice record already exists
      const { data: existingData, error: existingError } = await supabase
        .from('tblpractice')
        .select('id')
        .eq('userid', userId)
        .eq('exampleid', exampleId);
      
      if (existingError) throw existingError;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('tblpractice')
          .update({ score })
          .eq('userid', userId)
          .eq('exampleid', exampleId);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('tblpractice')
          .insert([{ userid: userId, exampleid: exampleId, score }]);
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving practice score:", error);
      return false;
    }
  };

  // Get next practice example - enhanced to avoid repeats
  const getNextPracticeExample = async (userId: number, difficulty: string): Promise<any> => {
    try {
      // Get the ID of the last example shown to this user
      const lastExampleId = lastExampleShown[userId] || -1;
      console.log("Last example shown:", lastExampleId);
      
      // First try to get examples with score less than 100, excluding the last example
      const { data: lowScoreExamples, error: lowScoreError } = await supabase
        .from('tblpractice')
        .select(`
          exampleid,
          score,
          tblexample!inner(
            exampleid,
            definitionid,
            english,
            persian,
            tblDefinition:definitionid!inner(
              tblWord:wordid!inner(
                difficulty
              )
            )
          )
        `)
        .eq('userid', userId)
        .eq('tblexample.tblDefinition.tblWord.difficulty', difficulty)
        .lt('score', 100)
        .neq('exampleid', lastExampleId)
        .limit(1);
      
      if (lowScoreError) throw lowScoreError;
      
      if (lowScoreExamples && lowScoreExamples.length > 0) {
        const example = lowScoreExamples[0].tblexample;
        // Update the last example shown for this user
        lastExampleShown[userId] = example.exampleid;
        console.log("Using low score example:", example.exampleid);
        return example;
      }
      
      // If no low score examples, get a random unpracticed example, excluding the last one
      const { data: unpracticedData, error: unpracticedError } = await supabase
        .rpc('get_unpracticed_examples', { 
          user_id: userId,
          diff: difficulty,
          last_example_id: lastExampleId
        })
        .limit(1);
      
      if (unpracticedError) {
        // If the RPC is not available, fallback to a more complex query
        const practicedIds = await getPracticedExampleIds(userId);
        
        const { data: unpracticedExamples, error: fallbackError } = await supabase
          .from('tblexample')
          .select(`
            exampleid,
            definitionid,
            english,
            persian,
            tblDefinition:definitionid!inner(
              tblWord:wordid!inner(
                difficulty
              )
            )
          `)
          .eq('tblDefinition.tblWord.difficulty', difficulty)
          .neq('exampleid', lastExampleId)
          .not('exampleid', 'in', `(${practicedIds.join(',')})`)
          .limit(1);
        
        if (fallbackError) throw fallbackError;
        
        if (unpracticedExamples && unpracticedExamples.length > 0) {
          // Update the last example shown for this user
          lastExampleShown[userId] = unpracticedExamples[0].exampleid;
          console.log("Using fallback unpracticed example:", unpracticedExamples[0].exampleid);
          return unpracticedExamples[0];
        }
      } else if (unpracticedData && unpracticedData.length > 0) {
        // Update the last example shown for this user
        lastExampleShown[userId] = unpracticedData[0].exampleid;
        console.log("Using unpracticed example:", unpracticedData[0].exampleid);
        return unpracticedData[0];
      }
      
      // If all examples have been practiced and scored >= 100, just get a random one excluding the last one
      const { data: randomExamples, error: randomError } = await supabase
        .from('tblexample')
        .select(`
          exampleid,
          definitionid,
          english,
          persian,
          tblDefinition:definitionid!inner(
            tblWord:wordid!inner(
              difficulty
            )
          )
        `)
        .eq('tblDefinition.tblWord.difficulty', difficulty)
        .neq('exampleid', lastExampleId)
        .order('exampleid', { ascending: false })
        .limit(1);
      
      if (randomError) throw randomError;
      
      if (randomExamples && randomExamples.length > 0) {
        // Update the last example shown for this user
        lastExampleShown[userId] = randomExamples[0].exampleid;
        console.log("Using random example:", randomExamples[0].exampleid);
        return randomExamples[0];
      }
      
      // If there's only one example for this difficulty level, use it even if it's the last one shown
      const { data: anyExample, error: anyError } = await supabase
        .from('tblexample')
        .select(`
          exampleid,
          definitionid,
          english,
          persian,
          tblDefinition:definitionid!inner(
            tblWord:wordid!inner(
              difficulty
            )
          )
        `)
        .eq('tblDefinition.tblWord.difficulty', difficulty)
        .limit(1);
      
      if (anyError) throw anyError;
      
      if (anyExample && anyExample.length > 0) {
        // Update the last example shown, even if it's the same
        lastExampleShown[userId] = anyExample[0].exampleid;
        console.log("Using any example (only one available):", anyExample[0].exampleid);
        return anyExample[0];
      }
      
      return null;
    } catch (error) {
      console.error("Error getting next practice example:", error);
      return null;
    }
  };

  // Helper function to get all practiced example IDs for a user
  const getPracticedExampleIds = async (userId: number): Promise<number[]> => {
    try {
      const { data, error } = await supabase
        .from('tblpractice')
        .select('exampleid')
        .eq('userid', userId);
      
      if (error) throw error;
      
      return (data || []).map(item => item.exampleid);
    } catch (error) {
      console.error("Error getting practiced example IDs:", error);
      return [];
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
