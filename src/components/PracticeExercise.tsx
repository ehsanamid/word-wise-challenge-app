
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useDatabase } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { calculateSimilarity } from '@/lib/similarity';

interface PracticeExerciseProps {
  difficulty: string;
  onComplete: () => void;
  onChangeDifficulty: () => void;
}

const PracticeExercise: React.FC<PracticeExerciseProps> = ({ 
  difficulty, 
  onComplete,
  onChangeDifficulty
}) => {
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
  const loadNextExample = () => {
    setLoading(true);
    setUserAnswer('');
    setShowWord(false);
    setShowAnswer(false);
    setScore(null);
    
    if (user) {
      const example = getNextPracticeExample(user.UserID, difficulty);
      
      if (example) {
        setCurrentExample(example);
        const info = getExampleInfo(example.exampleID);
        setExampleInfo(info);
      } else {
        toast({
          title: "No Examples Available",
          description: "No examples available for this difficulty level.",
          variant: "destructive"
        });
        onChangeDifficulty();
      }
    }
    
    setLoading(false);
  };

  // Load example on component mount or when difficulty changes
  useEffect(() => {
    loadNextExample();
  }, [difficulty, user]);

  // Handle submit answer
  const handleSubmit = () => {
    if (currentExample && userAnswer.trim()) {
      const similarityScore = calculateSimilarity(userAnswer, currentExample.English);
      setScore(similarityScore);
      
      // Save score to database
      if (user) {
        savePracticeScore(user.UserID, currentExample.exampleID, similarityScore);
      }
    }
  };

  // Handle next example
  const handleNextExample = () => {
    loadNextExample();
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading example...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentExample) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col justify-center items-center h-40 space-y-4">
            <p>No examples available for this difficulty level.</p>
            <Button onClick={onChangeDifficulty}>Change Difficulty</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Translation Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Persian text to translate */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Translate to English:</h3>
          <p className="text-2xl font-medium" dir="rtl">{currentExample.Persian}</p>
        </div>

        {/* Word hint (initially hidden) */}
        {showWord && exampleInfo && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-1">Key Word:</h3>
            <div className="flex flex-col gap-1">
              <p className="font-medium">{exampleInfo.word} <span className="text-sm text-gray-500">({exampleInfo.type})</span></p>
              <p className="text-sm text-gray-600">Pronunciation: {exampleInfo.pronunciation}</p>
              <p className="text-sm">{exampleInfo.definition}</p>
            </div>
          </div>
        )}

        {/* Answer input or display the correct answer */}
        {!score ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="answer" className="text-sm font-medium block mb-2">Your translation:</label>
              <Input
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your English translation here..."
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowWord(true)}
                disabled={showWord}
              >
                Show Word
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAnswer(true)}
                disabled={showAnswer}
              >
                Show Answer
              </Button>
              {showAnswer && (
                <div className="w-full mt-2 p-3 bg-green-50 rounded-md">
                  <p className="font-medium">Answer: {currentExample.English}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Answer:</h3>
              <p className="p-3 bg-gray-50 rounded-md">{userAnswer}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Correct Answer:</h3>
              <p className="p-3 bg-green-50 rounded-md">{currentExample.English}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Score:</h3>
              <div className="mb-2">
                <Progress value={score} className="h-2" />
              </div>
              <p className={`text-center font-bold text-lg ${
                score >= 80 ? "text-green-600" :
                score >= 50 ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {score}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onChangeDifficulty}
        >
          Change Difficulty
        </Button>
        {!score ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!userAnswer.trim()}
          >
            Submit
          </Button>
        ) : (
          <Button onClick={handleNextExample}>Next Example</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PracticeExercise;
