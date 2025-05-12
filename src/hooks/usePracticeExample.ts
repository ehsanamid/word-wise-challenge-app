
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useDatabase } from '@/lib/database';
import { lastExampleShown } from '@/integrations/supabase/client';

export const usePracticeExample = (difficulty: string, lastExampleId: number | null) => {
  const { user } = useAuth();
  const { getNextPracticeExample, getExampleInfo, savePracticeScore } = useDatabase();
  const { toast } = useToast();
  
  const [currentExample, setCurrentExample] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showWord, setShowWord] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [exampleInfo, setExampleInfo] = useState<any>(null);

  // Load a new practice example
  const loadNextExample = async () => {
    setLoading(true);
    setUserAnswer('');
    setShowWord(false);
    setShowAnswer(false);
    setScore(null);
    
    try {
      // Update lastExampleShown in memory to prevent getting the same example
      if (lastExampleId && user?.UserID) {
        lastExampleShown[user.UserID] = lastExampleId;
      }
      
      // We pass the user ID if available, otherwise we just get examples without tracking
      const userId = user?.UserID;
      const example = await getNextPracticeExample(userId, difficulty);
      
      if (example) {
        setCurrentExample(example);
        const info = await getExampleInfo(example.exampleid);
        setExampleInfo(info);
      } else {
        toast({
          title: "No Examples Available",
          description: "No examples available for this difficulty level.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading example:", error);
      toast({
        title: "Error",
        description: "Failed to load practice example.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  // Load example on component mount or when difficulty changes
  useEffect(() => {
    loadNextExample();
  }, [difficulty, user, lastExampleId]);

  // Save score to database
  const saveScore = (similarityScore: number) => {
    if (user?.UserID && currentExample) {
      savePracticeScore(user.UserID, currentExample.exampleid, similarityScore);
    }
  };

  return {
    currentExample,
    exampleInfo,
    userAnswer,
    setUserAnswer,
    showWord,
    setShowWord,
    showAnswer,
    setShowAnswer,
    score,
    setScore,
    loading,
    loadNextExample,
    saveScore
  };
};
