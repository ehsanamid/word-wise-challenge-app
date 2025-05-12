
import { supabase, lastExampleShown } from '@/integrations/supabase/client';
import { Practice } from './types';

// Get user practice examples
export const getUserPractice = async (userId: number): Promise<Practice[]> => {
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

// Save practice score
export const savePracticeScore = async (userId: number | undefined, exampleId: number, score: number): Promise<boolean> => {
  // Ensure userId is a valid number before proceeding
  if (userId === undefined || userId === null) {
    console.error("Cannot save practice score: User ID is undefined");
    return false;
  }
  
  try {
    console.log("Saving practice score:", { userId, exampleId, score });
    
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

// Helper function to get all practiced example IDs for a user
export const getPracticedExampleIds = async (userId: number): Promise<number[]> => {
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

// Get next practice example - enhanced to avoid repeats
export const getNextPracticeExample = async (userId: number | undefined, difficulty: string): Promise<any> => {
  // If userId is undefined, we can still provide examples but won't track user progress
  const isUserTracking = userId !== undefined && userId !== null;
  
  try {
    // Get the ID of the last example shown to this user
    const lastExampleId = isUserTracking ? (lastExampleShown[userId] || -1) : -1;
    console.log("Last example shown:", lastExampleId);
    
    // First try to get examples with score less than 100, excluding the last example
    // Only if we have a valid userId
    if (isUserTracking) {
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
        if (isUserTracking) {
          lastExampleShown[userId] = example.exampleid;
        }
        console.log("Using low score example:", example.exampleid);
        return example;
      }
    }
    
    // If no low score examples or no userId, get a random unpracticed example, excluding the last one
    if (isUserTracking) {
      const { data: unpracticedData, error: unpracticedError } = await supabase
        .rpc('get_unpracticed_examples', { 
          user_id: userId,
          diff: difficulty,
          last_example_id: lastExampleId
        });
      
      if (unpracticedError) {
        console.error("Error with RPC:", unpracticedError);
      } else if (unpracticedData && unpracticedData.length > 0) {
        // Update the last example shown for this user
        if (isUserTracking) {
          lastExampleShown[userId] = unpracticedData[0].exampleid;
        }
        console.log("Using unpracticed example:", unpracticedData[0].exampleid);
        return unpracticedData[0];
      }
    }
    
    // If no unpracticed examples or RPC failed, use fallback query
    if (isUserTracking) {
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
        .neq('exampleid', lastExampleId);
      
      if (fallbackError) throw fallbackError;
      
      // Filter out examples that have been practiced
      const filteredExamples = unpracticedExamples?.filter(
        example => !practicedIds.includes(example.exampleid)
      );
      
      if (filteredExamples && filteredExamples.length > 0) {
        // Update the last example shown for this user
        if (isUserTracking) {
          lastExampleShown[userId] = filteredExamples[0].exampleid;
        }
        console.log("Using fallback unpracticed example:", filteredExamples[0].exampleid);
        return filteredExamples[0];
      }
    }
    
    // If all examples have been practiced and scored >= 100, or if no user tracking,
    // just get a random one excluding the last one
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
      if (isUserTracking) {
        lastExampleShown[userId] = randomExamples[0].exampleid;
      }
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
      if (isUserTracking) {
        lastExampleShown[userId] = anyExample[0].exampleid;
      }
      console.log("Using any example (only one available):", anyExample[0].exampleid);
      return anyExample[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error getting next practice example:", error);
    return null;
  }
};
