
import { supabase } from '@/integrations/supabase/client';
import { Example } from './types';

// Get examples by difficulty
export const getExamplesByDifficulty = async (difficulty: string): Promise<Example[]> => {
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

// Get example info including word
export const getExampleInfo = async (exampleId: number) => {
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
